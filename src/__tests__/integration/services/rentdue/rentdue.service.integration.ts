import {Getter} from '@loopback/context';
import {expect} from '@loopback/testlab';
import {Booking, BookingType, Client} from '../../../../models';
import {
  BookingRepository,
  ClientRepository,
  DebitorRepository,
} from '../../../../repositories';
import {RentDueCalculationService} from '../../../../services/rentdue/rentdue.calculation.service';
import {RentDueService} from '../../../../services/rentdue/rentdue.service';
import {testdb} from '../../../fixtures/datasources/rentmontior.datasource';
import {givenEmptyDatabase} from '../../../helpers/database.helpers';

describe('RentDue Service Integration Tests', () => {
  let debitorRepository: DebitorRepository;
  let clientRepository: ClientRepository;
  let bookingRepository: BookingRepository;
  let rentDueService: RentDueService;
  let client: Client;

  beforeEach('setup service and database', async () => {
    await givenEmptyDatabase();

    bookingRepository = new BookingRepository(testdb);
    const bookingRepositoryGetter = Getter.fromValue(bookingRepository);
    debitorRepository = new DebitorRepository(testdb);
    const debitorRepositoryGetter = Getter.fromValue(debitorRepository);
    clientRepository = new ClientRepository(
      testdb,
      debitorRepositoryGetter,
      bookingRepositoryGetter,
    );
    client = await clientRepository.create({name: 'Test Client'});
    rentDueService = new RentDueService(
      debitorRepository,
      bookingRepository,
      new RentDueCalculationService(),
    );
  });

  after(async () => {});

  it('should create due booking for current month', async function() {
    // given
    let debitor = await debitorRepository.create({
      clientId: client.id,
      name: 'Test Debitor',
      start: new Date(2017, 0, 1),
      rentDueEveryMonth: 1,
      rentDueDayOfMonth: 10,
      amount: 1000,
    });
    await bookingRepository.create({
      clientId: client.id,
      debitorId: debitor.id,
      date: new Date(2019, 1, 10),
      comment: 'Rent 02/2019',
      amount: -900,
      type: BookingType.RENT_DUE,
    });
    await bookingRepository.create({
      clientId: client.id,
      debitorId: debitor.id,
      date: new Date(2019, 2, 10),
      comment: 'Rent 03/2019',
      amount: -1000,
      type: BookingType.RENT_DUE,
    });

    // when
    await rentDueService.calculateRentDueAndSaveResultsToDatabase(
      client.id,
      new Date(2019, 3, 15),
    );

    // then
    const newBooking: Booking | null = await bookingRepository.findOne({
      where: {clientId: client.id, debitorId: debitor.id},
      order: ['date DESC'],
      limit: 1,
    });
    expect(newBooking!.clientId).to.eql(client.id);
    expect(newBooking!.debitorId).to.eql(debitor.id);
    expect(newBooking!.date).to.eql(new Date(2019, 3, 10));
    expect(newBooking!.comment).to.eql('Rent');
    expect(newBooking!.amount).to.eql(-1000);
    expect(newBooking!.type).to.eql(BookingType.RENT_DUE);
  });
});

import {Getter} from '@loopback/context';
import {expect} from '@loopback/testlab';
import {
  Booking,
  BookingType,
  Client,
  Contract,
  Tenant,
} from '../../../../models';
import {
  BookingRepository,
  ClientRepository,
  ContractRepository,
  TenantRepository,
} from '../../../../repositories';
import {RentDueCalculationService} from '../../../../services/rentdue/rentdue.calculation.service';
import {RentDueService} from '../../../../services/rentdue/rentdue.service';
import {testdb} from '../../../fixtures/datasources/rentmontior.datasource';
import {givenEmptyDatabase} from '../../../helpers/database.helpers';

describe('RentDue Service Integration Tests', () => {
  let tenantRepository: TenantRepository;
  let contractRepository: ContractRepository;
  let clientRepository: ClientRepository;
  let bookingRepository: BookingRepository;
  let rentDueService: RentDueService;
  let client: Client;
  let tenant: Tenant;
  let contract: Contract;

  beforeEach('setup service and database', async () => {
    await givenEmptyDatabase();

    clientRepository = new ClientRepository(testdb);
    const clientRepositoryGetter = Getter.fromValue(clientRepository);
    tenantRepository = new TenantRepository(testdb, clientRepositoryGetter);
    const tenantRepositoryGetter = Getter.fromValue(tenantRepository);
    contractRepository = new ContractRepository(
      testdb,
      clientRepositoryGetter,
      tenantRepositoryGetter,
    );
    const contractRepositoryGetter = Getter.fromValue(contractRepository);
    bookingRepository = new BookingRepository(
      testdb,
      clientRepositoryGetter,
      tenantRepositoryGetter,
      contractRepositoryGetter,
    );
    client = await clientRepository.create({name: 'Test Client'});

    tenant = await tenantRepository.create({
      clientId: client.id,
      name: 'Test Debitor',
    });

    contract = await contractRepository.create({
      clientId: client.id,
      tenantId: tenant.id,
      start: new Date(2019, 1, 10),
      rentDueEveryMonth: 1,
      rentDueDayOfMonth: 10,
      amount: 1000,
    });
    rentDueService = new RentDueService(
      tenantRepository,
      contractRepository,
      bookingRepository,
      new RentDueCalculationService(),
    );
  });

  after(async () => {});

  it('should create due booking for current month', async function () {
    // given
    await bookingRepository.create({
      clientId: client.id,
      tenantId: tenant.id,
      contractId: contract.id,
      date: new Date(2019, 1, 10),
      comment: 'Rent 02/2019',
      amount: -900,
      type: BookingType.RENT_DUE,
    });
    await bookingRepository.create({
      clientId: client.id,
      tenantId: tenant.id,
      contractId: contract.id,
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
      where: {clientId: client.id},
      order: ['date DESC'],
      limit: 1,
    });
    expect(newBooking!.clientId).to.eql(client.id);
    expect(newBooking!.tenantId).to.eql(tenant.id);
    expect(newBooking!.contractId).to.eql(contract.id);
    expect(newBooking!.date).to.eql(new Date(2019, 3, 10));
    expect(newBooking!.comment).to.eql('Rent');
    expect(newBooking!.amount).to.eql(-1000);
    expect(newBooking!.type).to.eql(BookingType.RENT_DUE);
  });
});

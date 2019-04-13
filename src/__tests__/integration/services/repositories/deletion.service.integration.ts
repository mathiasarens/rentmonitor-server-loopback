import {Getter} from '@loopback/context';
import {expect} from '@loopback/testlab';
import {
  BookingRepository,
  ClientRepository,
  DebitorRepository,
} from '../../../../repositories';
import {DeletionService} from '../../../../services/repositories/deletion.service';
import {testdb} from '../../../fixtures/datasources/rentmontior.datasource';
import {givenEmptyDatabase} from '../../../helpers/database.helpers';
import {Client, Debitor, Booking} from '../../../../models';

describe('Deletion Service Integration', () => {
  let debitorRepository: DebitorRepository;
  let clientRepository: ClientRepository;
  let bookingRepository: BookingRepository;
  let deletionService: DeletionService;
  let client1: Client;
  let client2: Client;
  let debitor11: Debitor;
  let debitor21: Debitor;
  let booking111: Booking;
  let booking211: Booking;

  beforeEach('setupApplication', async () => {
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

    deletionService = new DeletionService(
      clientRepository,
      debitorRepository,
      bookingRepository,
    );

    client1 = await clientRepository.create({name: 'Client 1'});
    client2 = await clientRepository.create({name: 'Client 2'});
    debitor11 = await debitorRepository.create({
      clientId: client1.id,
      name: 'Client 1 - Debitor 1',
    });
    debitor21 = await debitorRepository.create({
      clientId: client2.id,
      name: 'Client 2 - Debitor 1',
    });
    booking111 = await bookingRepository.create({
      clientId: client1.id,
      debitorId: debitor11.id,
      date: new Date(),
    });
    booking211 = await bookingRepository.create({
      clientId: client2.id,
      debitorId: debitor21.id,
      date: new Date(),
    });
  });

  after(async () => {});

  it('should delete client 1', async function() {
    expect(await clientRepository.exists(client1.id)).to.be.true();
    expect(await clientRepository.exists(client2.id)).to.be.true();
    expect(await debitorRepository.exists(debitor11.id)).to.be.true();
    expect(await debitorRepository.exists(debitor21.id)).to.be.true();
    expect(await bookingRepository.exists(booking111.id)).to.be.true();
    expect(await bookingRepository.exists(booking211.id)).to.be.true();

    await deletionService.deleteClient(client1.id);

    expect(await clientRepository.exists(client1.id)).to.be.false();
    expect(await clientRepository.exists(client2.id)).to.be.true();
    expect(await debitorRepository.exists(debitor11.id)).to.be.false();
    expect(await debitorRepository.exists(debitor21.id)).to.be.true();
    expect(await bookingRepository.exists(booking111.id)).to.be.false();
    expect(await bookingRepository.exists(booking211.id)).to.be.true();
  });

  it('should delete all tables', async function() {
    expect(await clientRepository.find()).length(2);
    expect(await debitorRepository.find()).length(2);
    expect(await bookingRepository.find()).length(2);

    await deletionService.deleteAll();

    expect(await clientRepository.find()).length(0);
    expect(await debitorRepository.find()).length(0);
    expect(await bookingRepository.find()).length(0);
  });
});

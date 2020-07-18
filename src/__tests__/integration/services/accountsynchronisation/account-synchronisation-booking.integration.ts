import {Getter} from '@loopback/repository';
import {expect} from '@loopback/testlab';
import {
  AccountSettings,
  AccountTransaction,
  BookingType,
  Client,
  Tenant,
} from '../../../../models';
import {
  AccountTransactionRepository,
  BookingRepository,
  ClientRepository,
  ContractRepository,
  TenantRepository,
} from '../../../../repositories';
import {AccountSynchronisationBookingService} from '../../../../services/accountsynchronisation/account-synchronisation-booking.service';
import {testdb} from '../../../fixtures/datasources/rentmontior.datasource';
import {givenEmptyDatabase} from '../../../helpers/database.helpers';

describe('Account Synchronisation Booking Integration Tests', () => {
  let clientRepository: ClientRepository;
  let tenantRepository: TenantRepository;
  let contractRepository: ContractRepository;
  let bookingRepository: BookingRepository;
  let accountTransactionRepository: AccountTransactionRepository;
  let accountSynchronisationBookingService: AccountSynchronisationBookingService;
  let client1: Client;
  let tenant1: Tenant;

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
    bookingRepository = new BookingRepository(
      testdb,
      clientRepositoryGetter,
      tenantRepositoryGetter,
      Getter.fromValue(contractRepository),
    );
    accountTransactionRepository = new AccountTransactionRepository(
      testdb,
      clientRepositoryGetter,
      Getter.fromValue(bookingRepository),
    );
    accountSynchronisationBookingService = new AccountSynchronisationBookingService(
      contractRepository,
      bookingRepository,
      accountTransactionRepository,
    );

    client1 = await clientRepository.create({name: 'Client1'});
    tenant1 = await tenantRepository.create({name: 'Tenant1'});
  });

  after(async () => {});

  it('should save new bookings if contract active', async function () {
    // given
    const accountSettings = new AccountSettings({id: 1, clientId: client1.id});
    const accountTransaction1 = await accountTransactionRepository.create({
      clientId: client1.id,
      accountSettingsId: accountSettings.id,
      date: new Date(2019, 3, 14),
      iban: 'IBAN1',
      bic: 'BIC1',
      name: 'Tenant1 Account Name',
      text: 'text1',
      amount: 1000,
    });
    const contract1 = await contractRepository.create({
      clientId: client1.id,
      tenantId: tenant1.id,
      start: new Date(2018, 0, 1),
      amount: 5000,
      accountSynchronisationName: 'Tenant1 Account Name',
    });

    const accountTransactions = [accountTransaction1];

    // when
    const result = await accountSynchronisationBookingService.createAndSaveBookings(
      client1.id,
      accountTransactions,
      new Date(2019, 0, 1),
    );

    // then
    expect(result[0]).length(1);
    expect(result[1]).length(0);
    expect(result[0][0].accountTransactionId).to.eql(accountTransaction1.id);

    // booking
    const bookings = await bookingRepository.find({
      where: {clientId: client1.id},
    });
    expect(bookings).length(1);
    expect(bookings[0].clientId).to.eql(client1.id);
    expect(bookings[0].tenantId).to.eql(tenant1.id);
    expect(bookings[0].contractId).to.eql(contract1.id);
    expect(bookings[0].accountTransactionId).to.eql(accountTransaction1.id);
    expect(bookings[0].date).to.eql(accountTransaction1.date);
    expect(bookings[0].comment).to.eql(accountTransaction1.text);
    expect(bookings[0].amount).to.eql(accountTransaction1.amount);
    expect(bookings[0].type).to.eql(BookingType.RENT_DUE);

    // updated account transaction
    const savedAccountTransactions: AccountTransaction[] = await accountTransactionRepository.find(
      {
        where: {clientId: client1.id, accountSettingsId: accountSettings.id},
        order: ['date ASC'],
      },
    );
    expect(savedAccountTransactions).length(1);
    expect(savedAccountTransactions[0].bookingId).to.eql(result[0][0].id);
  });

  it('should not save new booking if contract is inactive', async function () {
    // given
    const accountSettings = new AccountSettings({id: 1, clientId: client1.id});
    const accountTransaction1 = await accountTransactionRepository.create({
      clientId: client1.id,
      accountSettingsId: accountSettings.id,
      date: new Date(2019, 3, 14),
      iban: 'IBAN1',
      bic: 'BIC1',
      name: 'Tenant1 Account Name',
      text: 'text1',
      amount: 1000,
    });
    await contractRepository.create({
      clientId: client1.id,
      tenantId: tenant1.id,
      start: new Date(2018, 0, 1),
      end: new Date(2018, 11, 31),
      amount: 5000,
      accountSynchronisationName: 'Tenant1 Account Name',
    });

    const accountTransactions = [accountTransaction1];

    // when
    const result = await accountSynchronisationBookingService.createAndSaveBookings(
      client1.id,
      accountTransactions,
      new Date(2019, 0, 1),
    );

    // then
    expect(result[0]).length(0);
    expect(result[1]).length(1);
    expect(result[1][0].bookingId).to.eql(undefined);

    // booking
    const bookings = await bookingRepository.find({
      where: {clientId: client1.id},
    });
    expect(bookings).length(0);

    // updated account transaction
    const savedAccountTransactions: AccountTransaction[] = await accountTransactionRepository.find(
      {
        where: {clientId: client1.id, accountSettingsId: accountSettings.id},
        order: ['date ASC'],
      },
    );
    expect(savedAccountTransactions).length(1);
    expect(savedAccountTransactions[0].bookingId).to.eql(null);
  });
});

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
  AccountSettingsRepository,
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
  let accountSettingsRepository: AccountSettingsRepository;
  let accountTransactionRepository: AccountTransactionRepository;
  let accountSynchronisationBookingService: AccountSynchronisationBookingService;
  let client1: Client;
  let tenant1: Tenant;
  let accountSettings1: AccountSettings;

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
    accountSettingsRepository = new AccountSettingsRepository(
      testdb,
      clientRepositoryGetter,
      'password',
      'salt',
    );
    accountTransactionRepository = new AccountTransactionRepository(
      testdb,
      clientRepositoryGetter,
      Getter.fromValue(bookingRepository),
    );
    accountSynchronisationBookingService = new AccountSynchronisationBookingService(
      tenantRepository,
      bookingRepository,
      accountTransactionRepository,
    );

    client1 = await clientRepository.create({name: 'Client1'});
    tenant1 = await tenantRepository.create({
      clientId: client1.id,
      name: 'Tenant1',
      accountSynchronisationName: 'Tenant1 Account Name',
    });
    accountSettings1 = await accountSettingsRepository.create(
      new AccountSettings({clientId: client1.id}),
    );
  });

  after(async () => {});

  it('should save new bookings if contract active', async function () {
    // given
    const accountTransaction1 = await accountTransactionRepository.create({
      clientId: client1.id,
      accountSettingsId: accountSettings1.id,
      date: new Date(2019, 3, 14),
      iban: 'IBAN1',
      bic: 'BIC1',
      name: 'Tenant1 Account Name',
      text: 'text1',
      amount: 1000,
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
    expect(bookings[0].accountTransactionId).to.eql(accountTransaction1.id);
    expect(bookings[0].date).to.eql(accountTransaction1.date);
    expect(bookings[0].comment).to.eql(accountTransaction1.text);
    expect(bookings[0].amount).to.eql(accountTransaction1.amount);
    expect(bookings[0].type).to.eql(BookingType.RENT_PAID_ALGO);

    // updated account transaction
    const savedAccountTransactions: AccountTransaction[] = await accountTransactionRepository.find(
      {
        where: {clientId: client1.id, accountSettingsId: accountSettings1.id},
        order: ['date ASC'],
      },
    );
    expect(savedAccountTransactions).length(1);
    expect(savedAccountTransactions[0].bookingId).to.eql(result[0][0].id);
  });
});

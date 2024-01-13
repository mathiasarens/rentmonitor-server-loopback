import {Getter} from '@loopback/repository';
import {expect} from '@loopback/testlab';
import {subDays} from 'date-fns';
import {
  AccountSettings,
  AccountTransaction,
  Booking,
  Contract,
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
import {TransactionToBookingService} from '../../../../services/accountsynchronisation/transaction-to-booking.service';
import {testdb} from '../../../fixtures/datasources/rentmontior.datasource';
import {givenEmptyDatabase} from '../../../helpers/database.helpers';

describe('Transaction To Booking Service Integration Tests', () => {
  let clientRepository: ClientRepository;
  let tenantRepository: TenantRepository;
  let contractRepository: ContractRepository;
  let bookingRepository: BookingRepository;
  let accountSettingsRepository: AccountSettingsRepository;
  let accountTransactionRepository: AccountTransactionRepository;
  let transactionSynchronisationService: TransactionToBookingService;
  let accountSynchronisationBookingService: AccountSynchronisationBookingService;

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
    );

    accountSynchronisationBookingService =
      new AccountSynchronisationBookingService(
        contractRepository,
        bookingRepository,
      );

    transactionSynchronisationService = new TransactionToBookingService(
      accountTransactionRepository,
      accountSynchronisationBookingService,
    );
  });

  after(async () => {});

  it('should create new bookings from existing transactions', async function () {
    // given
    const client = await clientRepository.create({
      name: 'Client Transaction Sychronization Tests',
    });
    const accountSettings = await accountSettingsRepository.create(
      new AccountSettings({clientId: client.id}),
    );

    const tenant1 = new Tenant({
      clientId: client.id,
      name: 'Tenant 1',
    });
    const savedTenant1 = await tenantRepository.create(tenant1);

    const unsavedContract1 = new Contract({
      clientId: client.id,
      tenantId: savedTenant1.id,
      start: new Date(2024, 1, 13),
      accountSynchronisationName: 'TestAccountSynchronisationName',
    });

    const savedContract1 = await contractRepository.save(unsavedContract1);

    const unsavedAccountTransaction1 = new AccountTransaction({
      clientId: client.id,
      accountSettingsId: accountSettings.id,
      date: new Date(2019, 3, 14),
      iban: 'IBAN1',
      bic: 'BIC1',
      name: savedContract1.accountSynchronisationName,
      text: 'Rent March 2019',
      amount: 1000,
    });
    const savedAccountTransaction1 = await accountTransactionRepository.create(
      unsavedAccountTransaction1,
    );

    // when
    const {newBookings, unmatchedTransactions} =
      await transactionSynchronisationService.createAndSaveBookingsForUnmatchedAccountTransactions(
        new Date(),
        client.id,
      );

    // than
    expect(newBookings).to.eql(1);
    expect(unmatchedTransactions).to.eql(0);

    const savedBookings: Booking[] = await bookingRepository.find({
      where: {clientId: client.id},
      order: ['date ASC'],
    });
    expect(savedBookings).length(1);
    expect(savedBookings[0].date).to.eql(unsavedAccountTransaction1.date);
    expect(savedBookings[0].tenantId).to.eql(savedTenant1.id);
    expect(savedBookings[0].comment).to.eql(unsavedAccountTransaction1.text);
    expect(savedBookings[0].amount).to.eql(unsavedAccountTransaction1.amount);
    expect(savedBookings[0].accountTransactionId).to.eql(
      savedAccountTransaction1.id,
    );
  });

  it('should not create duplicate bookings if a booking was already created for an tranacation', async function () {
    // given
    const client = await clientRepository.create({
      name: 'Client Transaction Sychronization Tests',
    });
    const accountSettings = await accountSettingsRepository.create(
      new AccountSettings({clientId: client.id}),
    );

    const tenant1 = new Tenant({
      clientId: client.id,
      name: 'Tenant 1',
    });
    const savedTenant1 = await tenantRepository.create(tenant1);

    const unsavedContract1 = new Contract({
      clientId: client.id,
      tenantId: savedTenant1.id,
      start: new Date(2024, 1, 13),
      accountSynchronisationName: 'TestAccountSynchronisationName',
    });
    const savedContract1 = await contractRepository.save(unsavedContract1);

    const unsavedAccountTransaction1 = new AccountTransaction({
      clientId: client.id,
      accountSettingsId: accountSettings.id,
      date: new Date(2019, 3, 14),
      iban: 'IBAN1',
      bic: 'BIC1',
      name: savedContract1.accountSynchronisationName,
      text: 'Rent March 2019',
      amount: 1000,
    });
    const savedAccountTransaction1 = await accountTransactionRepository.create(
      unsavedAccountTransaction1,
    );

    const unsavedBooking1 = new Booking({
      clientId: client.id,
      tenantId: savedTenant1.id,
      date: savedAccountTransaction1.date,
      comment: savedAccountTransaction1.text,
      amount: savedAccountTransaction1.amount,
      accountTransactionId: savedAccountTransaction1.id,
    });
    await bookingRepository.create(unsavedBooking1);

    // when
    const {newBookings, unmatchedTransactions} =
      await transactionSynchronisationService.createAndSaveBookingsForUnmatchedAccountTransactions(
        new Date(),
        client.id,
      );

    // than
    expect(newBookings).to.eql(0);
    expect(unmatchedTransactions).to.eql(1);

    const savedBookings: Booking[] = await bookingRepository.find({
      where: {clientId: client.id},
      order: ['date ASC'],
    });
    expect(savedBookings).length(1);
    expect(savedBookings[0].date).to.eql(unsavedAccountTransaction1.date);
    expect(savedBookings[0].tenantId).to.eql(savedTenant1.id);
    expect(savedBookings[0].comment).to.eql(unsavedAccountTransaction1.text);
    expect(savedBookings[0].amount).to.eql(unsavedAccountTransaction1.amount);
    expect(savedBookings[0].accountTransactionId).to.eql(
      savedAccountTransaction1.id,
    );
  });

  it('should not create new bookings if date filter does not match', async function () {
    // given
    const client = await clientRepository.create({
      name: 'Client Transaction Sychronization Tests',
    });
    const accountSettings = await accountSettingsRepository.create(
      new AccountSettings({clientId: client.id}),
    );

    const tenant1 = new Tenant({
      clientId: client.id,
      name: 'Tenant 1',
    });
    const savedTenant1 = await tenantRepository.create(tenant1);

    const unsavedContract1 = new Contract({
      clientId: client.id,
      tenantId: savedTenant1.id,
      start: new Date(2024, 1, 13),
      accountSynchronisationName: 'TestAccountSynchronisationName',
    });
    const savedContract1 = await contractRepository.save(unsavedContract1);

    const expectedDate = new Date(2019, 3, 14);
    const unsavedAccountTransaction1 = new AccountTransaction({
      clientId: client.id,
      accountSettingsId: accountSettings.id,
      date: expectedDate,
      iban: 'IBAN1',
      bic: 'BIC1',
      name: savedContract1.accountSynchronisationName,
      text: 'Rent March 2019',
      amount: 1000,
    });
    await accountTransactionRepository.create(unsavedAccountTransaction1);

    // when
    const {newBookings, unmatchedTransactions} =
      await transactionSynchronisationService.createAndSaveBookingsForUnmatchedAccountTransactions(
        new Date(),
        client.id,
        subDays(expectedDate, 60),
        subDays(expectedDate, 10),
      );

    // than
    expect(newBookings).to.eql(0);
    expect(unmatchedTransactions).to.eql(0);

    const savedBookings: Booking[] = await bookingRepository.find({
      where: {clientId: client.id},
      order: ['date ASC'],
    });
    expect(savedBookings).length(0);
  });
});

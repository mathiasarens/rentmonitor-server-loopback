import {Getter} from '@loopback/repository';
import {expect} from '@loopback/testlab';
import {Booking, Contract, Tenant} from '../../../../models';
import {
  BookingRepository,
  ClientRepository,
  ContractRepository,
  TenantRepository,
} from '../../../../repositories';
import {ContractToBookingService} from '../../../../services/accountsynchronisation/contract-to-booking.service';
import {testdb} from '../../../fixtures/datasources/rentmontior.datasource';
import {givenEmptyDatabase} from '../../../helpers/database.helpers';

describe('Contract To Booking Service Integration Tests', () => {
  let clientRepository: ClientRepository;
  let tenantRepository: TenantRepository;
  let contractRepository: ContractRepository;
  let bookingRepository: BookingRepository;
  let contractToBookingService: ContractToBookingService;

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

    contractToBookingService = new ContractToBookingService(
      bookingRepository,
      contractRepository,
    );
  });

  after(async () => {});

  it('should not create new booking if deferred start date of contract is after end of contract or now', async function () {
    // given
    const client = await clientRepository.create({
      name: 'Contract to booking integration test',
    });

    const tenant1 = new Tenant({
      clientId: client.id,
      name: 'Tenant 1',
    });
    const savedTenant1 = await tenantRepository.create(tenant1);

    const startDate = new Date(2019, 3, 14);
    const unsavedContract1 = new Contract({
      clientId: client.id,
      tenantId: savedTenant1.id,
      start: startDate,
      rentDueDayOfMonth: 10,
      rentDueEveryMonth: 1,
      amount: 1000,
    });
    await contractRepository.create(unsavedContract1);

    // when
    const {newBookings, matchedContracts, unmatchedContracts} =
      await contractToBookingService.createAndSaveBookingsForContracts(
        new Date(2019, 3, 15),
        client.id,
      );

    // than
    expect(newBookings).to.eql(0);
    expect(matchedContracts).to.eql(0);
    expect(unmatchedContracts).to.eql(1);

    const savedBookings: Booking[] = await bookingRepository.find({
      where: {clientId: client.id},
      order: ['date ASC'],
    });
    expect(savedBookings).length(0);
  });

  it('should create new booking if contract start date is a day before the due date', async function () {
    // given
    const client = await clientRepository.create({
      name: 'Contract to booking integration test',
    });

    const tenant1 = new Tenant({
      clientId: client.id,
      name: 'Tenant 1',
    });
    const savedTenant1 = await tenantRepository.create(tenant1);

    const startDate = new Date(2019, 3, 9);
    const unsavedContract1 = new Contract({
      clientId: client.id,
      tenantId: savedTenant1.id,
      start: startDate,
      rentDueDayOfMonth: 10,
      rentDueEveryMonth: 1,
      amount: 1000,
    });
    const savedContract1 = await contractRepository.create(unsavedContract1);

    // when
    const {newBookings, matchedContracts, unmatchedContracts} =
      await contractToBookingService.createAndSaveBookingsForContracts(
        new Date(2019, 3, 15),
        client.id,
      );

    // than
    expect(newBookings).to.eql(1);
    expect(matchedContracts).to.eql(1);
    expect(unmatchedContracts).to.eql(0);

    const savedBookings: Booking[] = await bookingRepository.find({
      where: {clientId: client.id},
      order: ['date ASC'],
    });
    expect(savedBookings).length(1);
    expect(savedBookings[0].date).to.eql(new Date(2019, 3, 10));
    expect(savedBookings[0].tenantId).to.eql(savedTenant1.id);
    expect(savedBookings[0].comment).to.eql('4/2019');
    expect(savedBookings[0].amount).to.eql(-1 * unsavedContract1.amount);
    expect(savedBookings[0].contractId).to.eql(savedContract1.id);
    expect(savedBookings[0].accountTransactionId).to.eql(null);
  });

  it('should create new booking if contract start date is on the same day as the due date', async function () {
    // given
    const client = await clientRepository.create({
      name: 'Contract to booking integration test',
    });

    const tenant1 = new Tenant({
      clientId: client.id,
      name: 'Tenant 1',
    });
    const savedTenant1 = await tenantRepository.create(tenant1);

    const startDate = new Date(2019, 3, 10);
    const unsavedContract1 = new Contract({
      clientId: client.id,
      tenantId: savedTenant1.id,
      start: startDate,
      rentDueDayOfMonth: 10,
      rentDueEveryMonth: 1,
      amount: 1000,
    });
    const savedContract1 = await contractRepository.create(unsavedContract1);

    // when
    const {newBookings, matchedContracts, unmatchedContracts} =
      await contractToBookingService.createAndSaveBookingsForContracts(
        new Date(2019, 3, 15),
        client.id,
      );

    // than
    expect(newBookings).to.eql(1);
    expect(matchedContracts).to.eql(1);
    expect(unmatchedContracts).to.eql(0);

    const savedBookings: Booking[] = await bookingRepository.find({
      where: {clientId: client.id},
      order: ['date ASC'],
    });
    expect(savedBookings).length(1);
    expect(savedBookings[0].date).to.eql(new Date(2019, 3, 10));
    expect(savedBookings[0].tenantId).to.eql(savedTenant1.id);
    expect(savedBookings[0].comment).to.eql('4/2019');
    expect(savedBookings[0].amount).to.eql(-1 * unsavedContract1.amount);
    expect(savedBookings[0].contractId).to.eql(savedContract1.id);
    expect(savedBookings[0].accountTransactionId).to.eql(null);
  });

  it('should create two new bookings', async function () {
    // given
    const client = await clientRepository.create({
      name: 'Contract to booking integration test',
    });

    const tenant1 = new Tenant({
      clientId: client.id,
      name: 'Tenant 1',
    });
    const savedTenant1 = await tenantRepository.create(tenant1);

    const startDate = new Date(2019, 3, 15);
    const unsavedContract1 = new Contract({
      clientId: client.id,
      tenantId: savedTenant1.id,
      start: startDate,
      rentDueDayOfMonth: 10,
      rentDueEveryMonth: 1,
      amount: 1000,
    });
    const savedContract1 = await contractRepository.create(unsavedContract1);

    // when
    const {newBookings, matchedContracts, unmatchedContracts} =
      await contractToBookingService.createAndSaveBookingsForContracts(
        new Date(2019, 5, 15),
        client.id,
      );

    // than
    expect(newBookings).to.eql(2);
    expect(matchedContracts).to.eql(1);
    expect(unmatchedContracts).to.eql(0);

    const savedBookings: Booking[] = await bookingRepository.find({
      where: {clientId: client.id},
      order: ['date ASC'],
    });
    expect(savedBookings).length(2);
    expect(savedBookings[0].date).to.eql(new Date(2019, 4, 10));
    expect(savedBookings[0].tenantId).to.eql(savedTenant1.id);
    expect(savedBookings[0].comment).to.eql('5/2019');
    expect(savedBookings[0].amount).to.eql(-1 * unsavedContract1.amount);
    expect(savedBookings[0].contractId).to.eql(savedContract1.id);
    expect(savedBookings[0].accountTransactionId).to.eql(null);

    expect(savedBookings[1].date).to.eql(new Date(2019, 5, 10));
    expect(savedBookings[1].tenantId).to.eql(savedTenant1.id);
    expect(savedBookings[1].comment).to.eql('6/2019');
    expect(savedBookings[1].amount).to.eql(-1 * unsavedContract1.amount);
    expect(savedBookings[1].contractId).to.eql(savedContract1.id);
    expect(savedBookings[1].accountTransactionId).to.eql(null);
  });

  it('should not create duplicate bookings', async function () {
    // given
    const client = await clientRepository.create({
      name: 'Contract to booking integration test',
    });

    const tenant1 = new Tenant({
      clientId: client.id,
      name: 'Tenant 1',
    });
    const savedTenant1 = await tenantRepository.create(tenant1);

    const startDate = new Date(2019, 3, 15);
    const unsavedContract1 = new Contract({
      clientId: client.id,
      tenantId: savedTenant1.id,
      start: startDate,
      rentDueDayOfMonth: 10,
      rentDueEveryMonth: 1,
      amount: 1000,
    });
    const savedContract1 = await contractRepository.create(unsavedContract1);

    const existingBooking = new Booking({
      date: new Date(2019, 4, 10),
      clientId: client.id,
      tenantId: savedTenant1.id,
      contractId: savedContract1.id,
      comment: 'Miete 4/2019',
      amount: -1 * unsavedContract1.amount,
    });
    await bookingRepository.create(existingBooking);

    // when
    const {newBookings, matchedContracts, unmatchedContracts} =
      await contractToBookingService.createAndSaveBookingsForContracts(
        new Date(2019, 5, 15),
        client.id,
      );

    // than
    expect(newBookings).to.eql(1);
    expect(matchedContracts).to.eql(1);
    expect(unmatchedContracts).to.eql(0);

    const savedBookings: Booking[] = await bookingRepository.find({
      where: {clientId: client.id, date: {gt: new Date(2019, 4, 10)}},
      order: ['date ASC'],
    });
    expect(savedBookings).length(1);

    expect(savedBookings[0].date).to.eql(new Date(2019, 5, 10));
    expect(savedBookings[0].tenantId).to.eql(savedTenant1.id);
    expect(savedBookings[0].comment).to.eql('6/2019');
    expect(savedBookings[0].amount).to.eql(-1 * unsavedContract1.amount);
    expect(savedBookings[0].contractId).to.eql(savedContract1.id);
    expect(savedBookings[0].accountTransactionId).to.eql(null);
  });

  it('should not create a booking on the last day of the contract', async function () {
    // given
    const client = await clientRepository.create({
      name: 'Contract to booking integration test',
    });

    const tenant1 = new Tenant({
      clientId: client.id,
      name: 'Tenant 1',
    });
    const savedTenant1 = await tenantRepository.create(tenant1);

    const startDate = new Date(2019, 3, 10);
    const endDate = new Date(2019, 4, 10);
    const unsavedContract1 = new Contract({
      clientId: client.id,
      tenantId: savedTenant1.id,
      start: startDate,
      end: endDate,
      rentDueDayOfMonth: 10,
      rentDueEveryMonth: 1,
      amount: 1000,
    });
    const savedContract1 = await contractRepository.create(unsavedContract1);

    // when
    const {newBookings, matchedContracts, unmatchedContracts} =
      await contractToBookingService.createAndSaveBookingsForContracts(
        new Date(2019, 5, 15),
        client.id,
      );

    // than
    expect(newBookings).to.eql(1);
    expect(matchedContracts).to.eql(1);
    expect(unmatchedContracts).to.eql(0);

    const savedBookings: Booking[] = await bookingRepository.find({
      where: {clientId: client.id},
      order: ['date ASC'],
    });
    expect(savedBookings).length(1);
    expect(savedBookings[0].date).to.eql(new Date(2019, 3, 10));
    expect(savedBookings[0].tenantId).to.eql(savedTenant1.id);
    expect(savedBookings[0].comment).to.eql('4/2019');
    expect(savedBookings[0].amount).to.eql(-1 * unsavedContract1.amount);
    expect(savedBookings[0].contractId).to.eql(savedContract1.id);
    expect(savedBookings[0].accountTransactionId).to.eql(null);
  });

  it('should only create a booking after from date', async function () {
    // given
    const client = await clientRepository.create({
      name: 'Contract to booking integration test',
    });

    const tenant1 = new Tenant({
      clientId: client.id,
      name: 'Tenant 1',
    });
    const savedTenant1 = await tenantRepository.create(tenant1);

    const startDate = new Date(2019, 3, 1);
    const unsavedContract1 = new Contract({
      clientId: client.id,
      tenantId: savedTenant1.id,
      start: startDate,
      rentDueDayOfMonth: 10,
      rentDueEveryMonth: 1,
      amount: 1000,
    });
    const savedContract1 = await contractRepository.create(unsavedContract1);
    const tenantIds: number[] = [savedTenant1.id];

    // when
    const {newBookings, matchedContracts, unmatchedContracts} =
      await contractToBookingService.createAndSaveBookingsForContracts(
        new Date(2019, 10, 15),
        client.id,
        tenantIds,
        new Date(2019, 9, 15),
      );

    // than
    expect(newBookings).to.eql(1);
    expect(matchedContracts).to.eql(1);
    expect(unmatchedContracts).to.eql(0);

    const savedBookings: Booking[] = await bookingRepository.find({
      where: {clientId: client.id},
      order: ['date ASC'],
    });
    expect(savedBookings).length(1);
    expect(savedBookings[0].date).to.eql(new Date(2019, 10, 10));
    expect(savedBookings[0].tenantId).to.eql(savedTenant1.id);
    expect(savedBookings[0].comment).to.eql('11/2019');
    expect(savedBookings[0].amount).to.eql(-1 * unsavedContract1.amount);
    expect(savedBookings[0].contractId).to.eql(savedContract1.id);
    expect(savedBookings[0].accountTransactionId).to.eql(null);
  });

  it('should only create a booking after from date and before to date', async function () {
    // given
    const client = await clientRepository.create({
      name: 'Contract to booking integration test',
    });

    const tenant1 = new Tenant({
      clientId: client.id,
      name: 'Tenant 1',
    });
    const savedTenant1 = await tenantRepository.create(tenant1);

    const startDate = new Date(2019, 3, 1);
    const unsavedContract1 = new Contract({
      clientId: client.id,
      tenantId: savedTenant1.id,
      start: startDate,
      rentDueDayOfMonth: 10,
      rentDueEveryMonth: 1,
      amount: 1000,
    });
    const savedContract1 = await contractRepository.create(unsavedContract1);
    const tenantIds: number[] = [savedTenant1.id];

    // when
    const {newBookings, matchedContracts, unmatchedContracts} =
      await contractToBookingService.createAndSaveBookingsForContracts(
        new Date(2019, 11, 15),
        client.id,
        tenantIds,
        new Date(2019, 8, 15),
        new Date(2019, 9, 15),
      );

    // than
    expect(newBookings).to.eql(1);
    expect(matchedContracts).to.eql(1);
    expect(unmatchedContracts).to.eql(0);

    const savedBookings: Booking[] = await bookingRepository.find({
      where: {clientId: client.id},
      order: ['date ASC'],
    });
    expect(savedBookings).length(1);
    expect(savedBookings[0].date).to.eql(new Date(2019, 9, 10));
    expect(savedBookings[0].tenantId).to.eql(savedTenant1.id);
    expect(savedBookings[0].comment).to.eql('10/2019');
    expect(savedBookings[0].amount).to.eql(-1 * unsavedContract1.amount);
    expect(savedBookings[0].contractId).to.eql(savedContract1.id);
    expect(savedBookings[0].accountTransactionId).to.eql(null);
  });

  it('should not create a booking if tenant filter does not match any existing tenant', async function () {
    // given
    const client = await clientRepository.create({
      name: 'Contract to booking integration test',
    });

    const tenant1 = new Tenant({
      clientId: client.id,
      name: 'Tenant 1',
    });
    const savedTenant1 = await tenantRepository.create(tenant1);

    const startDate = new Date(2019, 3, 1);
    const unsavedContract1 = new Contract({
      clientId: client.id,
      tenantId: savedTenant1.id,
      start: startDate,
      rentDueDayOfMonth: 10,
      rentDueEveryMonth: 1,
      amount: 1000,
    });
    await contractRepository.create(unsavedContract1);

    // when
    const {newBookings, matchedContracts, unmatchedContracts} =
      await contractToBookingService.createAndSaveBookingsForContracts(
        new Date(2019, 11, 15),
        client.id,
        [],
      );

    // than
    expect(newBookings).to.eql(0);
    expect(matchedContracts).to.eql(0);
    expect(unmatchedContracts).to.eql(0);

    const savedBookings: Booking[] = await bookingRepository.find({
      where: {clientId: client.id},
      order: ['date ASC'],
    });
    expect(savedBookings).length(0);
  });

  it('should create bookings for conscutive years ', async function () {
    // given
    const client = await clientRepository.create({
      name: 'Contract to booking integration test',
    });

    const tenant1 = new Tenant({
      clientId: client.id,
      name: 'Tenant 1',
    });
    const savedTenant1 = await tenantRepository.create(tenant1);

    const startDate = new Date(2017, 3, 1);
    const unsavedContract1 = new Contract({
      clientId: client.id,
      tenantId: savedTenant1.id,
      start: startDate,
      rentDueDayOfMonth: 10,
      rentDueEveryMonth: 12,
      amount: 1000,
    });
    const savedContract1 = await contractRepository.create(unsavedContract1);
    const tenantIds: number[] = [savedTenant1.id];

    // when
    const {newBookings, matchedContracts, unmatchedContracts} =
      await contractToBookingService.createAndSaveBookingsForContracts(
        new Date(2019, 11, 15),
        client.id,
        tenantIds,
        startDate,
      );

    // than
    expect(newBookings).to.eql(3);
    expect(matchedContracts).to.eql(1);
    expect(unmatchedContracts).to.eql(0);

    const savedBookings: Booking[] = await bookingRepository.find({
      where: {clientId: client.id},
      order: ['date ASC'],
    });
    expect(savedBookings).length(3);
    expect(savedBookings[0].date).to.eql(new Date(2017, 3, 10));
    expect(savedBookings[0].tenantId).to.eql(savedTenant1.id);
    expect(savedBookings[0].comment).to.eql('4/2017');
    expect(savedBookings[0].amount).to.eql(-1 * unsavedContract1.amount);
    expect(savedBookings[0].contractId).to.eql(savedContract1.id);
    expect(savedBookings[0].accountTransactionId).to.eql(null);

    expect(savedBookings[1].date).to.eql(new Date(2018, 3, 10));
    expect(savedBookings[1].tenantId).to.eql(savedTenant1.id);
    expect(savedBookings[1].comment).to.eql('4/2018');
    expect(savedBookings[1].amount).to.eql(-1 * unsavedContract1.amount);
    expect(savedBookings[1].contractId).to.eql(savedContract1.id);
    expect(savedBookings[1].accountTransactionId).to.eql(null);

    expect(savedBookings[2].date).to.eql(new Date(2019, 3, 10));
    expect(savedBookings[2].tenantId).to.eql(savedTenant1.id);
    expect(savedBookings[2].comment).to.eql('4/2019');
    expect(savedBookings[2].amount).to.eql(-1 * unsavedContract1.amount);
    expect(savedBookings[2].contractId).to.eql(savedContract1.id);
    expect(savedBookings[2].accountTransactionId).to.eql(null);
  });

  it('should handle a contract start date that is at the end of a year', async function () {
    // given
    const client = await clientRepository.create({
      name: 'Contract to booking integration test',
    });

    const tenant1 = new Tenant({
      clientId: client.id,
      name: 'Tenant 1',
    });
    const savedTenant1 = await tenantRepository.create(tenant1);

    const startDate = new Date(2017, 11, 31);
    const unsavedContract1 = new Contract({
      clientId: client.id,
      tenantId: savedTenant1.id,
      start: startDate,
      rentDueDayOfMonth: 10,
      rentDueEveryMonth: 12,
      amount: 1000,
    });
    const savedContract1 = await contractRepository.create(unsavedContract1);
    const tenantIds: number[] = [savedTenant1.id];

    // when
    const {newBookings, matchedContracts, unmatchedContracts} =
      await contractToBookingService.createAndSaveBookingsForContracts(
        new Date(2019, 11, 15),
        client.id,
        tenantIds,
        startDate,
      );

    // than
    expect(newBookings).to.eql(2);
    expect(matchedContracts).to.eql(1);
    expect(unmatchedContracts).to.eql(0);

    const savedBookings: Booking[] = await bookingRepository.find({
      where: {clientId: client.id},
      order: ['date ASC'],
    });
    expect(savedBookings).length(2);
    expect(savedBookings[0].date).to.eql(new Date(2018, 0, 10));
    expect(savedBookings[0].tenantId).to.eql(savedTenant1.id);
    expect(savedBookings[0].comment).to.eql('1/2018');
    expect(savedBookings[0].amount).to.eql(-1 * unsavedContract1.amount);
    expect(savedBookings[0].contractId).to.eql(savedContract1.id);
    expect(savedBookings[0].accountTransactionId).to.eql(null);

    expect(savedBookings[1].date).to.eql(new Date(2019, 0, 10));
    expect(savedBookings[1].tenantId).to.eql(savedTenant1.id);
    expect(savedBookings[1].comment).to.eql('1/2019');
    expect(savedBookings[1].amount).to.eql(-1 * unsavedContract1.amount);
    expect(savedBookings[1].contractId).to.eql(savedContract1.id);
    expect(savedBookings[1].accountTransactionId).to.eql(null);
  });
});

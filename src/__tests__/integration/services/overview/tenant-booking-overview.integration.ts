import {Getter} from '@loopback/repository';
import {expect} from '@loopback/testlab';
import {Booking, BookingType, Tenant} from '../../../../models';
import {
  BookingRepository,
  ClientRepository,
  ContractRepository,
  TenantRepository,
} from '../../../../repositories';
import {TenantBookingOverviewService} from '../../../../services/overview/tenant-booking-overview.service';
import {testdb} from '../../../fixtures/datasources/rentmontior.datasource';
import {givenEmptyDatabase} from '../../../helpers/database.helpers';

describe('Tenant Booking Overview Service Integration Tests', () => {
  let clientRepository: ClientRepository;
  let tenantRepository: TenantRepository;
  let contractRepository: ContractRepository;
  let bookingRepository: BookingRepository;
  let tenantBookingOverviewService: TenantBookingOverviewService;

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

    tenantBookingOverviewService = new TenantBookingOverviewService(
      bookingRepository,
      tenantRepository,
    );
  });

  after(async () => {});

  it('should sum booking amounts by tenant', async function () {
    // given
    const client = await clientRepository.create({
      name: 'Client Transaction Sychronization Tests',
    });

    const tenant1 = new Tenant({
      clientId: client.id,
      name: 'Tenant 1',
    });
    const savedTenant1 = await tenantRepository.create(tenant1);

    const tenant2 = new Tenant({
      clientId: client.id,
      name: 'Tenant 2',
    });
    const savedTenant2 = await tenantRepository.create(tenant2);

    const unsavedBooking1 = new Booking({
      clientId: client.id,
      tenantId: savedTenant1.id,
      date: new Date(2019, 3, 14),
      comment: '3/2019',
      amount: -1000,
      type: BookingType.RENT_DUE,
    });
    const unsavedBooking2 = new Booking({
      clientId: client.id,
      tenantId: savedTenant1.id,
      date: new Date(2019, 3, 15),
      comment: 'Rent 3/2019',
      amount: 1500,
      type: BookingType.RENT_PAID_ALGO,
    });
    const unsavedBooking3 = new Booking({
      clientId: client.id,
      tenantId: savedTenant2.id,
      date: new Date(2020, 5, 15),
      comment: 'Rent 5/2020',
      amount: -1200,
      type: BookingType.RENT_DUE,
    });
    const unsavedBooking4 = new Booking({
      clientId: client.id,
      tenantId: savedTenant2.id,
      date: new Date(2020, 6, 15),
      comment: 'Rent 6/2020',
      amount: -1200,
      type: BookingType.RENT_DUE,
    });

    await bookingRepository.createAll([
      unsavedBooking1,
      unsavedBooking2,
      unsavedBooking3,
      unsavedBooking4,
    ]);

    // when
    const results = await tenantBookingOverviewService.loadBookingSumPerTenant(
      client.id,
    );

    // than
    expect(results).length(2);
    expect(results[0].tenant.name).to.eql('Tenant 1');
    expect(results[0].sum).to.eql(500);
    expect(results[1].tenant.name).to.eql('Tenant 2');
    expect(results[1].sum).to.eql(-2400);
  });
});

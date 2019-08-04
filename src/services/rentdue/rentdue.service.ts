import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {Booking, BookingType, Contract, Tenant} from '../../models';
import {
  BookingRepository,
  ContractRepository,
  TenantRepository,
} from '../../repositories';
import {LatestRentDueBooking} from './latest.rent.due.booking';
import {RentDueCalculationService} from './rentdue.calculation.service';

export class RentDueService {
  constructor(
    @repository(TenantRepository) private tenantRepository: TenantRepository,
    @repository(ContractRepository)
    private contractRepository: ContractRepository,
    @repository(BookingRepository) private bookingRepository: BookingRepository,
    @inject('RentDueCalculationService')
    private rentDueCalculationService: RentDueCalculationService,
  ) {}

  public async calculateRentDueAndSaveResultsToDatabase(
    clientId: number,
    now: Date,
  ) {
    const latestBookingDatesPerDebitor: LatestRentDueBooking[] = await this.findLatestRentDueBookingsForDebitors(
      clientId,
    );
    const rentDueBookings: Booking[] = await this.rentDueCalculationService.calculateRentDueBookings(
      now,
      latestBookingDatesPerDebitor,
    );
    await this.bookingRepository.createAll(rentDueBookings);
  }

  private async findLatestRentDueBookingsForDebitors(
    clientId: number,
  ): Promise<LatestRentDueBooking[]> {
    const result: LatestRentDueBooking[] = new Array<LatestRentDueBooking>();
    const tenants: Tenant[] = await this.tenantRepository.find({
      where: {clientId: clientId},
    });
    for (const tenant of tenants) {
      const contractsPerTenant: Contract[] = await this.contractRepository.find(
        {where: {clientId: clientId, tenantId: tenant.id}},
      );
      for (const contract of contractsPerTenant) {
        const latestBookingDate:
          | Date
          | undefined = await this.findLatestBookingForTenantAndContract(
          clientId,
          tenant,
          contract,
        );
        result.push(new LatestRentDueBooking(contract, latestBookingDate));
      }
    }
    return Promise.resolve(result);
  }

  private async findLatestBookingForTenantAndContract(
    clientId: number,
    tenant: Tenant,
    contract: Contract,
  ): Promise<Date | undefined> {
    const booking: Booking | null = await this.bookingRepository.findOne({
      where: {
        clientId: clientId,
        tenantId: tenant.id,
        contractId: contract.id,
        type: BookingType.RENT_DUE,
      },
      order: ['date DESC'],
      limit: 1,
    });
    return Promise.resolve(booking!.date);
  }
}

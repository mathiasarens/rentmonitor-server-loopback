import {BindingKey} from '@loopback/core';
import {repository} from '@loopback/repository';
import {Booking, Contract, Tenant} from '../../models';
import {
  BookingRepository,
  ContractRepository,
  TenantRepository,
} from '../../repositories';

export class BookingSumPerTenant {
  constructor(public tenant: Tenant, public sum: number) {}
}
export class TenantBookingOverviewService {
  constructor(
    @repository(BookingRepository)
    private bookingRepository: BookingRepository,
    @repository(TenantRepository)
    private tenantRepository: TenantRepository,
    @repository(ContractRepository)
    private contractRepository: ContractRepository,
  ) {}

  public async loadBookingSumPerTenant(
    clientId: number,
  ): Promise<BookingSumPerTenant[]> {
    const resultMap = new Map<number, BookingSumPerTenant>();

    const tenants: Tenant[] = await this.tenantRepository.find({
      where: {clientId: clientId},
    });
    tenants.forEach(tenant =>
      resultMap.set(tenant.id, new BookingSumPerTenant(tenant, 0)),
    );

    const bookings: Booking[] = await this.bookingRepository.find({
      where: {clientId: clientId},
      order: ['date DESC'],
    });
    for (const booking of bookings) {
      resultMap.get(booking.tenantId)!.sum += booking.amount;
    }

    const contracts: Contract[] = await this.contractRepository.find({
      where: {clientId: clientId},
    });
    for (const contract of contracts) {
      resultMap.get(contract.tenantId)!.sum -= contract.deposit;
    }

    return Array.from(resultMap.values()).sort((a, b) =>
      a.sum < b.sum
        ? -1
        : a.sum > b.sum
        ? 1
        : a.tenant.name < b.tenant.name
        ? -1
        : a.tenant.name > b.tenant.name
        ? 1
        : 0,
    );
  }
}

export namespace TenantBookingOverviewServiceBindings {
  export const SERVICE = BindingKey.create<TenantBookingOverviewService>(
    'services.tenantbookingoverview.service',
  );
}

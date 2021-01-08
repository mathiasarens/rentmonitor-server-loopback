import {BindingKey} from '@loopback/core';
import {repository} from '@loopback/repository';
import {Booking, Tenant} from '../../models';
import {BookingRepository, TenantRepository} from '../../repositories';

export class BookingSumPerTenant {
  constructor(public tenant: Tenant, public sum: number) {}
}
export class TenantBookingOverviewService {
  constructor(
    @repository(BookingRepository)
    private bookingRepository: BookingRepository,
    @repository(TenantRepository)
    private tenantRepository: TenantRepository,
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

    return Array.from(resultMap.values());
  }
}

export namespace TenantBookingOverviewServiceBindings {
  export const SERVICE = BindingKey.create<TenantBookingOverviewService>(
    'services.tenantbookingoverview.service',
  );
}

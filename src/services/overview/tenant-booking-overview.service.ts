import {BindingKey} from '@loopback/core';
import {repository} from '@loopback/repository';
import {format} from 'date-fns';
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
    today: Date,
  ): Promise<BookingSumPerTenant[]> {
    // full set of tenants
    const tenantMap = new Map<number, Tenant>();
    // resultMap contains only tenants with at least one active contract
    const resultMap = new Map<number, BookingSumPerTenant>();

    const contracts: Contract[] = (
      await this.contractRepository.execute(
        `SELECT * FROM contract c WHERE c.clientId = ${clientId} and (c.end is null or c.end > '${format(
          today,
          'yyyy-MM-dd',
        )}');`,
      )
    ).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (resultItem: any | undefined) =>
        new Contract({
          id: resultItem?.id,
          tenantId: resultItem?.tenantid,
          start: resultItem?.start,
          end: resultItem?.end,
          deposit: resultItem?.deposit,
        }),
    );

    const tenantsFromDb: Tenant[] = await this.tenantRepository.find({
      where: {clientId: clientId},
    });
    tenantsFromDb.forEach(tenant => tenantMap.set(tenant.id, tenant));

    // only add tenants with at least one active contract to the resultMap
    for (const contract of contracts) {
      resultMap.set(
        contract.tenantId,
        new BookingSumPerTenant(tenantMap.get(contract.tenantId)!, 0),
      );
    }

    const bookings: Booking[] = await this.bookingRepository.find({
      where: {clientId: clientId},
      order: ['date DESC'],
    });
    for (const booking of bookings) {
      if (resultMap.has(booking.tenantId)) {
        resultMap.get(booking.tenantId)!.sum += booking.amount;
      }
    }

    // deduct deposits
    for (const contract of contracts) {
      if (resultMap.has(contract.tenantId)) {
        resultMap.get(contract.tenantId)!.sum -= contract.deposit;
      }
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

import { repository, WhereBuilder } from '@loopback/repository';
import isSameDay from 'date-fns/isSameDay';
import { Booking, Contract } from '../../models';
import { BookingRepository, ContractRepository } from '../../repositories';

export class ContractToBookingResult {
  constructor(
    public newBookings: number,
    public matchedContracts: number,
    public unmatchedContracts: number,
    public error?: string,
  ) { }
}
export class ContractToBookingService {
  constructor(
    @repository(BookingRepository)
    private bookingRepository: BookingRepository,
    @repository(ContractRepository)
    private contractRepository: ContractRepository,
  ) { }

  public async createAndSaveBookingsForContracts(
    now: Date,
    clientId: number,
    tenantIds?: number[],
    from?: Date,
    to?: Date,
  ): Promise<ContractToBookingResult> {
    const existingContracts = await this.loadExistingContracts(
      clientId,
      tenantIds,
    );

    const [
      newBookings,
      matchedContracts,
      unmatchedContracts,
    ] = await this.createNewBookingsForContracts(
      clientId,
      existingContracts,
      now,
      from,
      to
    );

    return new TransactionToBookingResult(
      newBookings.length,
      unmatchedAccountTransactions.length,
    );
  }

  private async createNewBookingsForContracts(clientId: number, existingContracts: Contract[], now: Date, from?: Date, to?: Date): Promise<[Booking[], Contract[], Contract[]]> {
    for (const contract of existingContracts) {
      await this.createNewBookingsForContract(clientId, contract, now, from, to);
    }
    return [null, null, null];
  }

  private async createNewBookingsForContract(clientId: number, contract: Contract, now: Date, from?: Date, to?: Date): Promise<[Booking[]]> {
    const calculatedStart: Date = this.maxStartDate(contract, from);
    const calculatedEnd: Date = this.minEndDate(contract, now, to);
    const rentDueDates: Date[] = this.calculateNextRentDueDates(contract, calculatedStart, calculatedEnd);
    const rentDueDatesFilteredByExistingBookings: Date[] = await this.filterExistingBookingsForRentDueDates(contract, rentDueDates);
    return null;
  }

  private async filterExistingBookingsForRentDueDates(contract: Contract, rentDueDates: Date[]): Promise<Date[]> {
    const existingBookings = await this.bookingRepository.find({ where: { clientId: contract.clientId, tenantId: contract.tenantId, contractId: contract.id }, order: ['date ASC'] });
    const result: Date[] = [];
    for (const booking in existingBookings) {
      for (const rentDueDate in rentDueDates) {
        if (isSameDay())
      }
    }
    return result;
  }

  private maxStartDate(contract: Contract, from?: Date): Date {
    let calculationStart: Date;
    if (from && from > contract.start) {
      calculationStart = from;
    } else {
      calculationStart = contract.start;
    }
    return new Date(calculationStart.getFullYear(), calculationStart.getMonth(), calculationStart.getDay());
  }

  private minEndDate(contract: Contract, now: Date, to?: Date): Date {
    let calculationEnd: Date;
    if (contract.end && contract.end < now) {
      calculationEnd = contract.end;
    } else {
      calculationEnd = now;
    }
    if (to && to < calculationEnd) {
      calculationEnd = to;
    }
    return calculationEnd;
  }

  private calculateNextRentDueDates(contract: Contract, calculationStart: Date, calculationEnd: Date): Date[] {
    const result: Date[] = [];
    if (isSameDay(contract.start, calculationStart)) {
      result.push(calculationStart);
    }
    let nextRentDueDate = this.nextPossibleRentDueDate(calculationStart, contract);
    while (nextRentDueDate < calculationEnd) {
      result.push(nextRentDueDate);
      nextRentDueDate = this.nextPossibleRentDueDate(calculationStart, contract);
    }
    return result;
  }

  private nextPossibleRentDueDate(
    lastRentDueDate: Date,
    contract: Contract,
  ): Date {
    return new Date(
      lastRentDueDate.getFullYear(),
      lastRentDueDate.getMonth() + contract.rentDueEveryMonth!,
      contract.rentDueDayOfMonth,
    );
  }

  private async loadExistingContracts(
    clientId: number,
    tenantIds?: number[]
  ): Promise<Contract[]> {
    const whereBuilder = new WhereBuilder();
    whereBuilder.eq('clientId', clientId);
    if (tenantIds) {
      whereBuilder.and({ tenantId: { inq: tenantIds } });
    }
    return this.contractRepository.find({
      where: whereBuilder.build(),
    });
  }
}

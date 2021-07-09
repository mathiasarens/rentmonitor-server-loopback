import {BindingKey} from '@loopback/core';
import {repository, WhereBuilder} from '@loopback/repository';
import {Booking, BookingType, Contract} from '../../models';
import {BookingRepository, ContractRepository} from '../../repositories';

export class ContractToBookingResult {
  constructor(
    public newBookings: number,
    public matchedContracts: number,
    public unmatchedContracts: number,
    public error?: string,
  ) {}
}
export class ContractToBookingService {
  constructor(
    @repository(BookingRepository)
    private bookingRepository: BookingRepository,
    @repository(ContractRepository)
    private contractRepository: ContractRepository,
  ) {}

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

    const result = await this.createNewBookingsForContracts(
      existingContracts,
      now,
      from,
      to,
    );

    return result;
  }

  private async createNewBookingsForContracts(
    existingContracts: Contract[],
    now: Date,
    from?: Date,
    to?: Date,
  ): Promise<ContractToBookingResult> {
    let bookings = 0;
    let matchedContracts = 0;
    let unmatchedContracts = 0;
    for (const contract of existingContracts) {
      const bookingList = await this.createNewBookingsForContract(
        contract,
        now,
        from,
        to,
      );
      bookings += bookingList.length;
      if (bookingList.length > 0) {
        matchedContracts += 1;
      } else {
        unmatchedContracts += 1;
      }
    }
    return new ContractToBookingResult(
      bookings,
      matchedContracts,
      unmatchedContracts,
    );
  }

  private async createNewBookingsForContract(
    contract: Contract,
    now: Date,
    from?: Date,
    to?: Date,
  ): Promise<Booking[]> {
    const calculatedStart: Date = this.maxStartDate(contract, from);
    const calculatedEnd: Date = this.minEndDate(contract, now, to);
    const rentDueDates: Date[] = this.calculateNextRentDueDates(
      contract,
      calculatedStart,
      calculatedEnd,
    );
    const rentDueDatesFilteredByExistingBookings: Date[] =
      await this.filterExistingBookingsForRentDueDates(contract, rentDueDates);
    const bookingList: Booking[] = this.createBookings(
      contract,
      rentDueDatesFilteredByExistingBookings,
    );
    const savedBookingList: Booking[] = await this.saveBookings(bookingList);
    return savedBookingList;
  }

  private maxStartDate(contract: Contract, from?: Date): Date {
    let calculationStart: Date;
    if (from && from > contract.start) {
      calculationStart = from;
    } else {
      calculationStart = contract.start;
    }
    return new Date(
      calculationStart.getFullYear(),
      calculationStart.getMonth(),
      calculationStart.getDate(),
    );
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

  private calculateNextRentDueDates(
    contract: Contract,
    calculationStart: Date,
    calculationEnd: Date,
  ): Date[] {
    const result: Date[] = [];
    const firstRentDueDate = new Date(
      calculationStart.getFullYear(),
      calculationStart.getMonth(),
      contract.rentDueDayOfMonth,
    );
    if (firstRentDueDate >= calculationStart) {
      result.push(firstRentDueDate);
    }
    let nextRentDueDate = this.nextPossibleRentDueDate(
      firstRentDueDate,
      contract,
    );
    while (nextRentDueDate < calculationEnd) {
      result.push(nextRentDueDate);
      nextRentDueDate = this.nextPossibleRentDueDate(nextRentDueDate, contract);
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

  private async filterExistingBookingsForRentDueDates(
    contract: Contract,
    rentDueDates: Date[],
  ): Promise<Date[]> {
    const existingBookings = await this.bookingRepository.find({
      where: {
        clientId: contract.clientId,
        tenantId: contract.tenantId,
        contractId: contract.id,
      },
      order: ['date ASC'],
    });
    const result: Date[] = [];

    if (existingBookings.length === 0) {
      result.push(...rentDueDates);
    } else {
      let i = 0;
      let j = 0;
      while (i < existingBookings.length && j < rentDueDates.length) {
        if (existingBookings[i].date > rentDueDates[j]) {
          result.push(rentDueDates[j]);
          j += 1;
        } else if (existingBookings[i].date < rentDueDates[j]) {
          i += 1;
        } else {
          i += 1;
          j += 1;
        }
      }
      while (j < rentDueDates.length) {
        result.push(rentDueDates[j]);
        j += 1;
      }
    }
    return result;
  }

  private createBookings(contract: Contract, rentDueDates: Date[]): Booking[] {
    const resultList: Booking[] = [];
    for (const rentDueDate of rentDueDates) {
      resultList.push(this.createBookingFromContract(contract, rentDueDate));
    }
    return resultList;
  }

  private createBookingFromContract(
    contract: Contract,
    rentDueDate: Date,
  ): Booking {
    return new Booking({
      date: rentDueDate,
      comment: `${rentDueDate.getMonth() + 1}/${rentDueDate.getFullYear()}`,
      amount: -1 * contract.amount,
      tenantId: contract.tenantId,
      clientId: contract.clientId,
      contractId: contract.id,
      type: BookingType.RENT_DUE,
    });
  }

  private async saveBookings(bookingList: Booking[]): Promise<Booking[]> {
    return this.bookingRepository.createAll(bookingList);
  }

  private async loadExistingContracts(
    clientId: number,
    tenantIds?: number[],
  ): Promise<Contract[]> {
    const whereBuilder = new WhereBuilder();
    whereBuilder.eq('clientId', clientId);
    if (tenantIds) {
      whereBuilder.and({tenantId: {inq: tenantIds}});
    }
    return this.contractRepository.find({
      where: whereBuilder.build(),
    });
  }
}

export namespace ContractToBookingServiceBindings {
  export const SERVICE = BindingKey.create<ContractToBookingService>(
    'services.contracttobooking.service',
  );
}

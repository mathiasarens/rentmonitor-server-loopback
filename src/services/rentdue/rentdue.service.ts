import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {Booking, BookingType, Debitor} from '../../models';
import {BookingRepository, DebitorRepository} from '../../repositories';
import {LatestRentDueBooking} from './latest.rent.due.booking';
import {RentDueCalculationService} from './rentdue.calculation.service';

export class RentDueService {
  constructor(
    @repository(DebitorRepository) private debitorRepository: DebitorRepository,
    @repository(BookingRepository) private bookingRepository: BookingRepository,
    @inject('RentDueCalculationService')
    private rentDueCalculationService: RentDueCalculationService,
  ) {}

  public async calculateRentDueAndSaveResultsToDatabase(
    clientId: number,
    today: Date,
  ) {
    const latestBookingDatesPerDebitor: LatestRentDueBooking[] = await this.findLatestRentDueBookingsForDebitors(
      clientId,
    );
    const rentDueBookings: Booking[] = await this.rentDueCalculationService.calculateRentDueBookings(
      today,
      latestBookingDatesPerDebitor,
    );
    await this.bookingRepository.createAll(rentDueBookings);
  }

  private async findLatestRentDueBookingsForDebitors(
    clientId: number,
  ): Promise<LatestRentDueBooking[]> {
    const result: LatestRentDueBooking[] = new Array<LatestRentDueBooking>();
    const debitors: Debitor[] = await this.debitorRepository.find({
      where: {clientId: clientId},
    });
    for (let debitor of debitors) {
      const latestBookingDate:
        | Date
        | undefined = await this.findLatestBookingForDebitor(clientId, debitor);
      result.push(new LatestRentDueBooking(debitor, latestBookingDate));
    }
    return Promise.resolve(result);
  }

  private async findLatestBookingForDebitor(
    clientId: number,
    debitor: Debitor,
  ): Promise<Date | undefined> {
    let booking: Booking | null = await this.bookingRepository.findOne({
      where: {
        clientId: clientId,
        debitorId: debitor.id,
        type: BookingType.RENT_DUE,
      },
      order: ['date DESC'],
      limit: 1,
    });
    return Promise.resolve(booking!.date);
  }
}

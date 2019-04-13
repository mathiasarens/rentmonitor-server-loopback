import {
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  repository,
} from '@loopback/repository';
import {Client, Debitor, Booking} from '../models';
import {RentmonitorDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {DebitorRepository, BookingRepository} from '.';

export class ClientRepository extends DefaultCrudRepository<
  Client,
  typeof Client.prototype.id
> {
  public readonly debitors: HasManyRepositoryFactory<
    Debitor,
    typeof Client.prototype.id
  >;

  public readonly bookings: HasManyRepositoryFactory<
    Booking,
    typeof Client.prototype.id
  >;

  constructor(
    @inject('datasources.rentmonitor') dataSource: RentmonitorDataSource,
    @repository.getter('DebitorRepository')
    debitorRepositoryGetter: Getter<DebitorRepository>,
    @repository.getter('BookingRepository')
    bookingRepositoryGetter: Getter<BookingRepository>,
  ) {
    super(Client, dataSource);
    this.debitors = this.createHasManyRepositoryFactoryFor(
      'debitors',
      debitorRepositoryGetter,
    );
    this.bookings = this.createHasManyRepositoryFactoryFor(
      'bookings',
      bookingRepositoryGetter,
    );
  }
}

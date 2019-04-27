import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {RentmonitorDataSource} from '../datasources';
import {Client} from '../models';

export class ClientRepository extends DefaultCrudRepository<
  Client,
  typeof Client.prototype.id
> {
  // public readonly debitors: HasManyRepositoryFactory<
  //   Tenant,
  //   typeof Client.prototype.id
  // >;

  // public readonly bookings: HasManyRepositoryFactory<
  //   Booking,
  //   typeof Client.prototype.id
  // >;

  constructor(
    @inject('datasources.rentmonitor') dataSource: RentmonitorDataSource,
    // @repository.getter('DebitorRepository')
    // debitorRepositoryGetter: Getter<TenantRepository>,
    // @repository.getter('BookingRepository')
    // bookingRepositoryGetter: Getter<BookingRepository>,
  ) {
    super(Client, dataSource);
    // this.debitors = this.createHasManyRepositoryFactoryFor(
    //   'debitors',
    //   debitorRepositoryGetter,
    // );
    // this.bookings = this.createHasManyRepositoryFactoryFor(
    //   'bookings',
    //   bookingRepositoryGetter,
    // );
  }
}

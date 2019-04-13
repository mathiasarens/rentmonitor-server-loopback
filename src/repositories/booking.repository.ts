import {inject} from '@loopback/context';
import {DefaultCrudRepository} from '@loopback/repository';
import {RentmonitorDataSource} from '../datasources';
import {Booking} from '../models';

export class BookingRepository extends DefaultCrudRepository<
  Booking,
  typeof Booking.prototype.id
> {
  // public readonly client: BelongsToAccessor<Client, typeof Client.prototype.id>;

  // public readonly debitor: BelongsToAccessor<
  //   Debitor,
  //   typeof Debitor.prototype.id
  // >;

  constructor(
    @inject('datasources.rentmonitor') dataSource: RentmonitorDataSource,
    // @repository.getter(ClientRepository)
    // getClientRepository: Getter<ClientRepository>,
    // @repository.getter(DebitorRepository)
    // getDebitorRepository: Getter<DebitorRepository>,
  ) {
    super(Booking, dataSource);
    // this.client = this.createBelongsToAccessorFor(
    //   'client',
    //   getClientRepository,
    // );
    // this.debitor = this.createBelongsToAccessorFor(
    //   'debitor',
    //   getDebitorRepository,
    // );
  }
}

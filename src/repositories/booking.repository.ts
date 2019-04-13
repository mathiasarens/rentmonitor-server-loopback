import {Getter, inject} from '@loopback/context';
import {
  DefaultCrudRepository,
  BelongsToAccessor,
  repository,
} from '@loopback/repository';
import {Booking, Debitor, Client} from '../models';
import {RentmonitorDataSource} from '../datasources';
import {ClientRepository} from '.';
import {DebitorRepository} from './debitor.repository';

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

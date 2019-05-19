import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  repository,
} from '@loopback/repository';
import {BookingRepository} from '.';
import {RentmonitorDataSource} from '../datasources';
import {AccountTransaction, Booking, Client} from '../models';
import {ClientRepository} from './client.repository';

export class AccountTransactionRepository extends DefaultCrudRepository<
  AccountTransaction,
  typeof AccountTransaction.prototype.id
> {
  public readonly client: BelongsToAccessor<
    Client,
    typeof AccountTransaction.prototype.id
  >;

  public readonly booking: BelongsToAccessor<
    Booking,
    typeof AccountTransaction.prototype.id
  >;

  constructor(
    @inject('datasources.rentmonitor') dataSource: RentmonitorDataSource,
    @repository.getter('ClientRepository')
    clientRepositoryGetter: Getter<ClientRepository>,
    @repository.getter('BookingRepository')
    bookingRepositoryGetter: Getter<BookingRepository>,
  ) {
    super(AccountTransaction, dataSource);

    this.client = this.createBelongsToAccessorFor(
      'client',
      clientRepositoryGetter,
    );

    this.booking = this.createBelongsToAccessorFor(
      'booking',
      bookingRepositoryGetter,
    );
  }
}

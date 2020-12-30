import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  repository,
} from '@loopback/repository';
import {RentmonitorDataSource} from '../datasources';
import {AccountTransaction, Client} from '../models';
import {ClientRepository} from './client.repository';

export class AccountTransactionRepository extends DefaultCrudRepository<
  AccountTransaction,
  typeof AccountTransaction.prototype.id
> {
  public readonly client: BelongsToAccessor<
    Client,
    typeof AccountTransaction.prototype.id
  >;

  constructor(
    @inject('datasources.rentmonitor') dataSource: RentmonitorDataSource,
    @repository.getter('ClientRepository')
    clientRepositoryGetter: Getter<ClientRepository>,
  ) {
    super(AccountTransaction, dataSource);

    this.client = this.createBelongsToAccessorFor(
      'client',
      clientRepositoryGetter,
    );
  }
}

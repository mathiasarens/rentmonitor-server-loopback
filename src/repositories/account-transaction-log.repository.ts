import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  repository,
} from '@loopback/repository';
import {ClientRepository} from '.';
import {RentmonitorDataSource} from '../datasources';
import {AccountTransactionLog, Client} from '../models';

export class AccountTransactionLogRepository extends DefaultCrudRepository<
  AccountTransactionLog,
  typeof AccountTransactionLog.prototype.id
> {
  public readonly client: BelongsToAccessor<
    Client,
    typeof AccountTransactionLog.prototype.id
  >;

  constructor(
    @inject('datasources.rentmonitor') dataSource: RentmonitorDataSource,
    @repository.getter('ClientRepository')
    clientRepositoryGetter: Getter<ClientRepository>,
  ) {
    super(AccountTransactionLog, dataSource);

    this.client = this.createBelongsToAccessorFor(
      'client',
      clientRepositoryGetter,
    );
  }
}

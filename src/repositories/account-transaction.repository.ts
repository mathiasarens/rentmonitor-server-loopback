import {DefaultCrudRepository} from '@loopback/repository';
import {AccountTransaction} from '../models';
import {RentmonitorDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class AccountTransactionRepository extends DefaultCrudRepository<
  AccountTransaction,
  typeof AccountTransaction.prototype.id
> {
  constructor(
    @inject('datasources.rentmonitor') dataSource: RentmonitorDataSource,
  ) {
    super(AccountTransaction, dataSource);
  }
}

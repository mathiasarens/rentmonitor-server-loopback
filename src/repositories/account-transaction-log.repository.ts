import {DefaultCrudRepository} from '@loopback/repository';
import {AccountTransactionLog} from '../models';
import {RentmonitorDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class AccountTransactionLogRepository extends DefaultCrudRepository<
  AccountTransactionLog,
  typeof AccountTransactionLog.prototype.id
> {
  constructor(
    @inject('datasources.rentmonitor') dataSource: RentmonitorDataSource,
  ) {
    super(AccountTransactionLog, dataSource);
  }
}

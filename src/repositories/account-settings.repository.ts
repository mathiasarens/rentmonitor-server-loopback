import {DefaultCrudRepository} from '@loopback/repository';
import {AccountSettings} from '../models';
import {RentmonitorDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class AccountSettingsRepository extends DefaultCrudRepository<
  AccountSettings,
  typeof AccountSettings.prototype.id
> {
  constructor(
    @inject('datasources.rentmonitor') dataSource: RentmonitorDataSource,
  ) {
    super(AccountSettings, dataSource);
  }
}

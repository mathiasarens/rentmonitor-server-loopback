import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {RentmonitorDataSource} from '../datasources';
import {AccountSettings} from '../models';

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

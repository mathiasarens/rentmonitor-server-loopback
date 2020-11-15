import {belongsTo, Entity, model, property} from '@loopback/repository';
import {AccountSettings} from './account-settings.model';
import {Client} from './client.model';

@model({
  settings: {
    foreignKeys: {
      fkAccountTransactionLogClientId: {
        name: 'fk_accountTransactionLog_clientId',
        entity: 'Client',
        entityKey: 'id',
        foreignKey: 'clientid',
      },
      fkAccountTransactionLogAccountSettingsId: {
        name: 'fk_accountTransactionLog_accountSettingsId',
        entity: 'AccountSettings',
        entityKey: 'id',
        foreignKey: 'accountsettingsid',
      },
    },
  },
})
export class AccountTransactionLog extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id: number;

  @belongsTo(() => Client)
  clientId: number;

  @belongsTo(() => AccountSettings)
  accountSettingsId: number;

  @property({
    type: 'date',
    required: true,
  })
  time: Date;

  @property({
    type: 'string',
    required: true,
  })
  rawstring: string;

  constructor(data?: Partial<AccountTransactionLog>) {
    super(data);
  }
}

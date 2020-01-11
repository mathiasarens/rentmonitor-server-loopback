import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Client} from './client.model';

@model({
  settings: {
    hiddenProperties: ['fintsPassword'],
    // foreignKeys: {
    //   fkAccountSettingsClientId: {
    //     name: 'fk_accountSettings_clientId',
    //     entity: 'Client',
    //     entityKey: 'id',
    //     foreignKey: 'clientid',
    //   },
    // },
  },
})
export class AccountSettings extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id: number;

  @belongsTo(() => Client)
  clientId: number;

  @property({
    type: 'string',
  })
  name: string;

  @property({
    type: 'string',
  })
  fintsBlz: string;

  @property({
    type: 'string',
  })
  fintsUrl: string;

  @property({
    type: 'string',
  })
  fintsUser: string;

  @property({
    type: 'string',
  })
  fintsPassword: string;

  @property({
    type: 'string',
  })
  selectedAccount: string;

  constructor(data?: Partial<AccountSettings>) {
    super(data);
  }
}

export interface AccountSettingsRelations {
  // describe navigational properties here
}

export type AccountSettingsWithRelations = AccountSettings &
  AccountSettingsRelations;

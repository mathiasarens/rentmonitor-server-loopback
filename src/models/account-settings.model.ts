import {
  belongsTo,
  DataObject,
  Entity,
  model,
  property,
} from '@loopback/repository';
import {Client} from './client.model';

@model({
  settings: {
    hiddenProperties: ['fintsPassword'],
    foreignKeys: {
      fkAccountSettingsClientId: {
        name: 'fk_accountSettings_clientId',
        entity: 'Client',
        entityKey: 'id',
        foreignKey: 'clientid',
        onDelete: 'CASCADE',
        onUpdate: 'SET NULL',
      },
    },
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
  iban: string;

  @property({
    type: 'string',
  })
  bic: string;

  @property({
    type: 'string',
  })
  rawAccount: string;

  @property({
    type: 'string',
  })
  fintsTanRequiredError?: string;

  constructor(data?: DataObject<AccountSettings>) {
    super(data);
  }
}

export interface AccountSettingsRelations {
  // describe navigational properties here
}

export type AccountSettingsWithRelations = AccountSettings &
  AccountSettingsRelations;

import {belongsTo, Entity, model, property} from '@loopback/repository';
import {AccountSettings} from './account-settings.model';
import {Client} from './client.model';

@model()
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

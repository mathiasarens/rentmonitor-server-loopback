import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Client} from './client.model';

@model()
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
  fintsBlz?: string;

  @property({
    type: 'string',
  })
  fintsUrl?: string;

  @property({
    type: 'string',
  })
  fintsUser?: string;

  @property({
    type: 'string',
  })
  fintsPassword?: string;

  constructor(data?: Partial<AccountSettings>) {
    super(data);
  }
}

import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Client} from './client.model';
@model({
  indexes: {
    clientId_name_index: {
      keys: {clientId: 1, name: 1},
      options: {unique: true},
    },
  },
})
export class Tenant extends Entity {
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
    required: true,
  })
  name: string;

  @property({
    type: 'string',
  })
  email: string;

  @property({
    type: 'string',
  })
  phone: string;

  constructor(data?: Partial<Tenant>) {
    super(data);
  }
}

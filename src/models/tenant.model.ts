import {
  belongsTo,
  Entity,
  hasMany,
  model,
  property,
} from '@loopback/repository';
import {Contract} from '.';
import {Client} from './client.model';
@model({
  indexes: {
    clientIdNameIndex: {
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

  @hasMany(() => Contract)
  contracts: Contract[];

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

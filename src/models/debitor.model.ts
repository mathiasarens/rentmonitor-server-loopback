import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Client} from './client.model';
@model({
  indexes: {
    clientId_name_index: {
      keys: {clientId: 1, name: 1},
      options: {unique: true},
    },
  },
})
export class Debitor extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

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

  @property({
    type: 'date',
  })
  start?: Date;

  @property({
    type: 'date',
  })
  end?: Date;

  @property({
    type: 'number',
  })
  rentDueEveryMonth?: number;

  @property({
    type: 'number',
  })
  rentDueDayOfMonth?: number;

  @property({
    type: 'number',
  })
  amount?: number;

  constructor(data?: Partial<Debitor>) {
    super(data);
  }
}

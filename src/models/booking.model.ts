import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Client} from './client.model';
import {Debitor} from './debitor.model';
@model({
  indexes: {
    clientId_name_index: {
      keys: {clientId: 1, name: 1},
      options: {unique: true},
    },
  },
})
export class Booking extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @belongsTo(() => Client)
  clientId: number;

  @belongsTo(() => Debitor)
  debitorId: number;

  @property({
    type: 'date',
    required: true,
  })
  date: string;

  @property({
    type: 'string',
  })
  comment?: string;

  @property({
    type: 'number',
  })
  amount?: number;

  constructor(data?: Partial<Booking>) {
    super(data);
  }
}

import {Entity, hasMany, model, property} from '@loopback/repository';
import {Debitor, Booking} from '.';

@model()
export class Client extends Entity {
  @property({
    id: true,
    type: 'number',
    generated: true,
  })
  id: number;

  @property({
    type: 'string',
    required: true,
    index: {
      unique: true,
    },
  })
  name: string;

  @hasMany(() => Debitor)
  debitors?: Debitor[];

  @hasMany(() => Booking)
  bookings?: Booking[];

  constructor(data?: Partial<Client>) {
    super(data);
  }
}

import { belongsTo, Entity, model, property } from '@loopback/repository';
import { Contract } from '.';
import { AccountTransaction } from './account-transaction.model';
import { Client } from './client.model';
import { Tenant } from './tenant.model';
@model({
  settings: {
    // foreignKeys: {
    //   fkBookingClientId: {
    //     name: 'fk_booking_clientId',
    //     entity: 'Client',
    //     entityKey: 'id',
    //     foreignKey: 'clientid',
    //   },
    //   fkBookingTenantId: {
    //     name: 'fk_booking_tenantId',
    //     entity: 'Tenant',
    //     entityKey: 'id',
    //     foreignKey: 'tenantid',
    //   },
    //   fkBookingContractId: {
    //     name: 'fk_booking_contractId',
    //     entity: 'Contract',
    //     entityKey: 'id',
    //     foreignKey: 'contractid',
    //   },
    //   fkBookingAccountTransactionId: {
    //     name: 'fk_booking_accountTransactionId',
    //     entity: 'AccountTransaction',
    //     entityKey: 'id',
    //     foreignKey: 'accounttransactionid',
    //   },
    // },
  },
})
export class Booking extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id: number;

  @belongsTo(() => Client)
  clientId: number;

  @belongsTo(() => Tenant)
  tenantId: number;

  @belongsTo(() => Contract)
  contractId?: number;

  @belongsTo(() => AccountTransaction)
  accountTransactionId?: number;

  @property({
    type: 'date',
    required: true,
  })
  date: Date;

  @property({
    type: 'string',
    jsonSchema: { nullable: true },
  })
  comment?: string;

  @property({
    type: 'number',
    required: true,
  })
  amount: number;

  @property({
    type: 'string',
    jsonSchema: { nullable: true },
  })
  type?: string;

  constructor(data?: Partial<Booking>) {
    super(data);
  }
}

export enum BookingType {
  RENT_DUE = 'RENT_DUE',
  RENT_PAID_ALGO = 'RENT_PAID_ALGO',
  RENT_PAID_MANUAL = 'RENT_PAID_MANUAL',
}

import { Getter } from '@loopback/core';
import { BelongsToAccessor, DefaultCrudRepository } from '@loopback/repository';
import { BookingRepository } from '.';
import { RentmonitorDataSource } from '../datasources';
import { AccountTransaction, Booking, Client } from '../models';
import { ClientRepository } from './client.repository';
export declare class AccountTransactionRepository extends DefaultCrudRepository<AccountTransaction, typeof AccountTransaction.prototype.id> {
    readonly client: BelongsToAccessor<Client, typeof AccountTransaction.prototype.id>;
    readonly booking: BelongsToAccessor<Booking, typeof AccountTransaction.prototype.id>;
    constructor(dataSource: RentmonitorDataSource, clientRepositoryGetter: Getter<ClientRepository>, bookingRepositoryGetter: Getter<BookingRepository>);
}

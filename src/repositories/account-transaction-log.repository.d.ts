import { Getter } from '@loopback/core';
import { BelongsToAccessor, DefaultCrudRepository } from '@loopback/repository';
import { ClientRepository } from '.';
import { RentmonitorDataSource } from '../datasources';
import { AccountTransactionLog, Client } from '../models';
export declare class AccountTransactionLogRepository extends DefaultCrudRepository<AccountTransactionLog, typeof AccountTransactionLog.prototype.id> {
    readonly client: BelongsToAccessor<Client, typeof AccountTransactionLog.prototype.id>;
    constructor(dataSource: RentmonitorDataSource, clientRepositoryGetter: Getter<ClientRepository>);
}

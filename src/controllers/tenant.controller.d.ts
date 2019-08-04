import { Count, Filter, Where } from '@loopback/repository';
import { Tenant } from '../models';
import { TenantRepository } from '../repositories';
export declare class TenantControllerController {
    tenantRepository: TenantRepository;
    constructor(tenantRepository: TenantRepository);
    create(tenant: Tenant): Promise<Tenant>;
    count(where?: Where<Tenant>): Promise<Count>;
    find(filter?: Filter<Tenant>): Promise<Tenant[]>;
    updateAll(tenant: Tenant, where?: Where<Tenant>): Promise<Count>;
    findById(id: number): Promise<Tenant>;
    updateById(id: number, tenant: Tenant): Promise<void>;
    replaceById(id: number, tenant: Tenant): Promise<void>;
    deleteById(id: number): Promise<void>;
}

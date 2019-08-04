import { juggler } from '@loopback/repository';
export declare class RentmonitorDataSource extends juggler.DataSource {
    static dataSourceName: string;
    constructor(dsConfig?: object, dsTestConfig?: object);
}

import { Client } from '@loopback/testlab';
import { RentmonitorServerApplication } from '../..';
export declare function setupApplication(): Promise<AppWithClient>;
export interface AppWithClient {
    app: RentmonitorServerApplication;
    client: Client;
}
export declare function givenEmptyDatabase(app: RentmonitorServerApplication): Promise<void>;

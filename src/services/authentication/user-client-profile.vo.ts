import {UserProfile} from '@loopback/authentication';

export interface UserClientProfile extends UserProfile {
  clientId: number;
}

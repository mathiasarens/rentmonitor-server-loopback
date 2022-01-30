// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {TokenService} from '@loopback/authentication';
import {inject} from '@loopback/context';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import jwt, {JwtPayload} from 'jsonwebtoken';
import {TokenServiceBindings} from '../../keys';
import {AwsJwkService} from './aws.jwk.service';

export class AwsAccessTokenService implements TokenService {
  constructor(
    @inject(TokenServiceBindings.AWS_COGNITO_JWK_SERVICE)
    private awsJwkService: AwsJwkService,
    @inject(TokenServiceBindings.AWS_COGNITO_JWT_AUDIENCE)
    private expectedAudience: string,
    @inject(TokenServiceBindings.AWS_COGNITO_JWT_ISSUER)
    private expectedIssuer: string,
  ) {}

  async verifyToken(token: string): Promise<UserProfile> {
    if (!token) {
      throw new HttpErrors.Unauthorized(
        `Error verifying token : 'token' is null`,
      );
    }
    const pems = await this.awsJwkService.getPems();
    let userProfile: UserProfile;

    try {
      let decodedToken: jwt.JwtPayload;
      try {
        // first pem
        decodedToken = jwt.verify(token, pems[0], {
          algorithms: ['RS256'],
        }) as JwtPayload;
      } catch (error) {
        console.log(`Could not decrypt token ${token} with ${pems[0]}`);
        console.log(`Error: ${error}`);
        console.log(`Trying second key: ${pems[1]}`);
        // second pem
        decodedToken = jwt.verify(token, pems[1], {
          algorithms: ['RS256'],
        }) as JwtPayload;
      }
      // verify decoded token
      if (decodedToken.client_id !== this.expectedAudience) {
        throw new HttpErrors.Unauthorized(`Invalid audience ${decodedToken}`);
      }
      if (decodedToken.iss !== this.expectedIssuer) {
        throw new HttpErrors.Unauthorized(`Invalid issuer ${decodedToken}`);
      }
      if (decodedToken['token_use'] !== 'access') {
        throw new HttpErrors.Unauthorized(`Invalid token_use ${decodedToken}`);
      }

      // convert token into userprofile
      if (typeof decodedToken === 'object') {
        userProfile = Object.assign(
          {[securityId]: '', name: '', clientId: 0},
          {
            [securityId]: decodedToken.username,
          },
        );
      } else {
        throw new HttpErrors.Unauthorized(
          `Token verification failed with ${decodedToken}`,
        );
      }
    } catch (error) {
      throw new HttpErrors.Unauthorized(
        `Error verifying token : ${error.message}`,
      );
    }
    return userProfile;
  }

  async generateToken(userProfile: UserProfile): Promise<string> {
    throw new Error('not supported');
  }
}

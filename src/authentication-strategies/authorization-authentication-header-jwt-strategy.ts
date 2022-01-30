// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {AuthenticationStrategy, TokenService} from '@loopback/authentication';
import {inject} from '@loopback/context';
import {HttpErrors, Request} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {TokenServiceBindings} from '../keys';

export class JWTAuthorizationAuthenticationHeaderStrategy
  implements AuthenticationStrategy
{
  name = 'jwt';

  constructor(
    @inject(TokenServiceBindings.AWS_COGNITO_ACCESS_TOKEN_SERVICE)
    public accessTokenService: TokenService,
    @inject(TokenServiceBindings.AWS_COGNITO_ID_TOKEN_SERVICE)
    public idTokenService: TokenService,
  ) {}

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    const accessToken: string = this.extractAccessToken(request);
    const idToken: string = this.extractIdToken(request);
    const userAccessProfile: UserProfile =
      await this.accessTokenService.verifyToken(accessToken);
    const userIdProfile: UserProfile = await this.idTokenService.verifyToken(
      idToken,
    );
    const userProfile = Object.assign(
      {[securityId]: '', name: '', clientId: 0},
      {
        [securityId]: userAccessProfile[securityId],
        name: userIdProfile.name,
        clientId: userIdProfile.clientId,
      },
    );
    return userProfile;
  }

  extractAccessToken(request: Request): string {
    if (!request.headers.authorization) {
      throw new HttpErrors.Unauthorized(`Authorization header not found.`);
    }

    // for example : Bearer xxx.yyy.zzz
    const authHeaderValue = request.headers.authorization;

    if (!authHeaderValue.startsWith('Bearer')) {
      throw new HttpErrors.Unauthorized(
        `Authorization header is not of type 'Bearer'.`,
      );
    }

    //split the string into 2 parts : 'Bearer ' and the `xxx.yyy.zzz`
    const parts = authHeaderValue.split(' ');
    if (parts.length !== 2)
      throw new HttpErrors.Unauthorized(
        `Authorization header value has too many parts. It must follow the pattern: 'Bearer xx.yy.zz' where xx.yy.zz is a valid JWT token.`,
      );
    const token = parts[1];

    return token;
  }

  extractIdToken(request: Request): string {
    if (request.headers.authentication) {
      // for example : Bearer xxx.yyy.zzz
      const authHeaderValue = request.headers.authentication;
      let authHeaderValueString: string;
      if (Array.isArray(authHeaderValue)) {
        authHeaderValueString = authHeaderValue[0];
      } else {
        authHeaderValueString = authHeaderValue;
      }
      if (!authHeaderValueString.startsWith('Bearer')) {
        throw new HttpErrors.Unauthorized(
          `Authentication header is not of type 'Bearer'.`,
        );
      }

      //split the string into 2 parts : 'Bearer ' and the `xxx.yyy.zzz`
      const parts = authHeaderValueString.split(' ');
      if (parts.length !== 2)
        throw new HttpErrors.Unauthorized(
          `Authentication header value has too many parts. It must follow the pattern: 'Bearer xx.yy.zz' where xx.yy.zz is a valid JWT token.`,
        );
      const token = parts[1];
      return token;
    }
    return '';
  }
}

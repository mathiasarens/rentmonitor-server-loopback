// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: loopback4-example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {TokenService} from '@loopback/authentication';
import {BindingKey} from '@loopback/context';
import {AwsJwkService} from './authentication-strategies/services/aws.jwk.service';

export namespace TokenServiceBindings {
  export const AWS_COGNITO_JWK_URL = BindingKey.create<string>(
    'authentication.jwt.aws.cognito.jwk.url',
  );
  export const AWS_COGNITO_JWT_AUDIENCE = BindingKey.create<string>(
    'authentication.jwt.aws.cognito.audience',
  );
  export const AWS_COGNITO_JWT_ISSUER = BindingKey.create<string>(
    'authentication.jwt.aws.cognito.issuer',
  );
  export const AWS_COGNITO_JWK_SERVICE = BindingKey.create<AwsJwkService>(
    'authentication.jwt.aws.cognito.jwk.service',
  );
  export const AWS_COGNITO_ACCESS_TOKEN_SERVICE =
    BindingKey.create<TokenService>(
      'services.authentication.jwt.aws.cognito.access.tokenservice',
    );
  export const AWS_COGNITO_ID_TOKEN_SERVICE = BindingKey.create<TokenService>(
    'services.authentication.jwt.aws.cognito.id.tokenservice',
  );
}

// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: loopback4-example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {TokenService, UserService} from '@loopback/authentication';
import {BindingKey} from '@loopback/context';
import {AwsJwkService} from './authentication-strategies/services/aws.jwk.service';
import {User} from './models';
import {Credentials} from './repositories';
import {PasswordHasher} from './services/authentication/hash.password.bcryptjs';

export namespace TokenServiceConstants {
  export const TOKEN_EXPIRES_IN_VALUE = '3600';
}

export namespace TokenServiceBindings {
  export const LOCAL_TOKEN_SECRET = BindingKey.create(
    'authentication.jwt.local.secret',
  );
  export const LOCAL_TOKEN_EXPIRES_IN = BindingKey.create<string>(
    'authentication.jwt.local.expires.in.seconds',
  );
  export const LOCAL_TOKEN_SERVICE = BindingKey.create<TokenService>(
    'services.authentication.jwt.local.tokenservice',
  );

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

export namespace PasswordHasherBindings {
  export const PASSWORD_HASHER =
    BindingKey.create<PasswordHasher>('services.hasher');
  export const ROUNDS = BindingKey.create<number>('services.hasher.round');
}

export namespace UserServiceBindings {
  export const USER_SERVICE = BindingKey.create<UserService<User, Credentials>>(
    'services.user.service',
  );
}

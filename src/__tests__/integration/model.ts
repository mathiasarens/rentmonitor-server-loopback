import {modelToJsonSchema} from '@loopback/repository-json-schema';
import {Client} from '../../../src/models/client.model';

describe('Model Schema Test', () => {
  it('should print the JSON schema for the client model', async function() {
    const jsonSchema = modelToJsonSchema(Client);
    console.log(jsonSchema);
  });
});

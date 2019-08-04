"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const repository_json_schema_1 = require("@loopback/repository-json-schema");
const client_model_1 = require("../../models/client.model");
describe('Model Schema Test', () => {
    it('should print the JSON schema for the client model', async function () {
        const jsonSchema = repository_json_schema_1.modelToJsonSchema(client_model_1.Client);
        console.log(jsonSchema);
    });
});
//# sourceMappingURL=model.js.map
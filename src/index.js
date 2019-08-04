"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const application_1 = require("./application");
exports.RentmonitorServerApplication = application_1.RentmonitorServerApplication;
async function main(options = {}) {
    options.rest.cors = {
        origin: true,
    };
    const app = new application_1.RentmonitorServerApplication(options);
    console.log('Database password: ' + process.env.DB_PASSWORD);
    app.bind('datasources.encryption.password').to(process.env.DB_PASSWORD);
    await app.boot();
    await app.start();
    const url = app.restServer.url;
    console.log(`Server is running at ${url}`);
    console.log(`Try ${url}/ping`);
    return app;
}
exports.main = main;
//# sourceMappingURL=index.js.map
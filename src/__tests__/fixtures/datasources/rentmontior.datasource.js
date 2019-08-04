"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const repository_1 = require("@loopback/repository");
const config = require("./rentmonitor.datasource.json");
class RentmonitorTestDataSource extends repository_1.juggler.DataSource {
    constructor(dsConfig = config) {
        super(dsConfig);
    }
}
exports.testdb = new RentmonitorTestDataSource();
//# sourceMappingURL=rentmontior.datasource.js.map
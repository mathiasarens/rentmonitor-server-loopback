const AWS = require('aws-sdk');

const application = require('../dist');
const awsServerlessExpress = require('aws-serverless-express');

const app = new application.RentmonitorServerApplication({
  rest: {
    openApiSpec: {
      setServersFromRequest: true,
    },
  },
});
const server = awsServerlessExpress.createServer(app.restServer.requestHandler);

exports.handler = async (event, context) => {
  await app.boot();
  return awsServerlessExpress.proxy(server, event, context, 'PROMISE').promise;
};

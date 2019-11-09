# Rentmonitor Server [![CircleCI](https://circleci.com/gh/mathiasarens/rentmonitor-server-loopback.svg?style=svg)](https://circleci.com/gh/mathiasarens/rentmonitor-server-loopback)

The rent monitor server API.

The default configuration uses a postgresql database. But any SQL database supported by loopback can be used.

In case you are using postgresql please run these commands to setup the databases:

createuser rentmonitor -P
createuser rentmonitor_test -P
createdb rentmonitor_test --owner rentmonitor_test --username <user with createdb permissions>
createdb rentmonitor --owner rentmonitor --username <user with createdb permissions>

To setup both databases run:

npm run migrate
npm run migrate:testdb

If you have trouble running the tests because the database schema is not up-to-date please run:

npm run migrate:testdb

# Rentmonitor Server [![CircleCI](https://circleci.com/gh/mathiasarens/rentmonitor-server-loopback.svg?style=svg)](https://circleci.com/gh/mathiasarens/rentmonitor-server-loopback)

The rent monitor server API.

The default configuration uses a postgresql database. But any SQL database
supported by loopback can be used.

In case you are using postgresql please run these commands to setup the
databases:

```
createuser rentmonitor -P
CREATE USER rentmonitor WITH ENCRYPTED PASSWORD ‘mypass’;
createuser rentmonitor_test -P

createdb rentmonitor_test --owner rentmonitor_test --username <user with createdb permissions>

createdb rentmonitor --owner rentmonitor --username <user with createdb permissions>
CREATE DATABASE rentmonitor OWNER rentmonitor;
```

To setup both databases run:

npm run migrate
npm run migrate:testdb

If you have trouble running the tests because the database schema is not
up-to-date please run:

npm run migrate:testdb

## Docker setup

### Raspberry Pi0W

docker network create rentmonitor-network
docker run --network rentmonitor-network --name postgresdb -e POSTGRES_PASSWORD=postgres -d arm32v6/postgres:13-alpine

docker exec -it postgresdb bash
psql -h localhost -p 5432 -U postgres -W

CREATE ROLE rentmonitor WITH LOGIN PASSWORD 'mypass';
CREATE DATABASE rentmonitor OWNER rentmonitor;

#### Build docker image

docker build -t arm32v6/rentmonitor-server-loopback:1.0.0 .

#### Save docker image to file

docker save -o /tmp/rentmonitor-server-loopback-1.0.0.img arm32v6/rentmonitor-server-loopback:1.0.0

#### Copy image via ssh to Raspberry Pi0W

scp /tmp/rentmonitor-server-loopback-1.0.0.img pirate@pi0w:~/rentmonitor-server-loopback-1.0.0.img

#### Install image on Raspberry Pi0W

docker load -i rentmonitor-server-loopback-1.0.0.img

#### Start container on Raspberry Pi0W

docker run --network rentmonitor-network -e RENTMONITOR_DB_HOST -e RENTMONITOR_DB_PORT -e RENTMONITOR_DB_NAME -e RENTMONITOR_DB_USER -e RENTMONITOR_DB_PASSWORD -e RENTMONITOR_DB_ENCRYPTION_SECRET -e RENTMONITOR_DB_ENCRYPTION_SALT -e RENTMONITOR_JWT_SECRET -p 3000:3000 -d arm32v6/rentmonitor-server-loopback:1.0.0

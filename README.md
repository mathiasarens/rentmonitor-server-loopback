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

createdb $RENTMONITOR_DB_USER --owner $RENTMONITOR_DB_USER --username <user with createdb permissions>
CREATE DATABASE $RENTMONITOR_DB_USER OWNER $RENTMONITOR_DB_USER;
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
docker run --network rentmonitor-network --name postgresdb -e POSTGRES_PASSWORD=postgres -d --restart unless-stopped arm32v6/postgres:13-alpine

docker exec -it postgresdb bash
psql -h localhost -p 5432 -U postgres -W

CREATE ROLE $RENTMONITOR_DB_USER WITH LOGIN PASSWORD $RENTMONITOR_DB_PASSWORD;
CREATE DATABASE $RENTMONITOR_DB_USER OWNER $RENTMONITOR_DB_USER;

#### Build docker image

docker build -t arm32v6/rentmonitor-server-loopback:1.0.1 .

#### Save docker image to file

docker save -o /tmp/rentmonitor-server-loopback-1.0.1.img arm32v6/rentmonitor-server-loopback:1.0.1

#### Copy image via ssh to Raspberry Pi0W

scp /tmp/rentmonitor-server-loopback-1.0.1.img $RENTMONITOR_DEPLOY_HOST:~/rentmonitor-server-loopback-1.0.1.img

#### Install image on Raspberry Pi0W

docker load -i rentmonitor-server-loopback-1.0.1.img

#### Start container on Raspberry Pi0W

docker run --network rentmonitor-network --name rentmonitor-server -e RENTMONITOR_DB_HOST -e RENTMONITOR_DB_PORT -e RENTMONITOR_DB_NAME -e RENTMONITOR_DB_USER -e RENTMONITOR_DB_PASSWORD -e RENTMONITOR_DB_ENCRYPTION_SECRET -e RENTMONITOR_DB_ENCRYPTION_SALT -e RENTMONITOR_JWT_SECRET -p 3000:3000 -d arm32v6/rentmonitor-server-loopback:1.0.1

#### Restore database dump

cat rentmonitor_dump.sql | docker exec -i postgresdb psql -U $RENTMONITOR_DB_USER

#### Create AWS Elastic Beanstalk environment

eb create --region us-east-1 --database --database.engine postgres --database.user $RENTMONITOR_DB_USER --database.password $RENTMONITOR_DB_PASSWORD --envvars RENTMONITOR_DB_HOST=$RENTMONITOR_DB_HOST,RENTMONITOR_DB_PORT=$RENTMONITOR_DB_PORT,RENTMONITOR_DB_USER=$RENTMONITOR_DB_USER,RENTMONITOR_DB_PASSWORD=$RENTMONITOR_DB_PASSWORD,RENTMONITOR_DB_ENCRYPTION_SECRET=$RENTMONITOR_DB_ENCRYPTION_SECRET,RENTMONITOR_DB_ENCRYPTION_SALT=$RENTMONITOR_DB_ENCRYPTION_SALT,RENTMONITOR_JWT_SECRET=$RENTMONITOR_JWT_SECRET

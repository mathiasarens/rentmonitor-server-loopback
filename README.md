# Rentmonitor Server [![CircleCI](https://circleci.com/gh/mathiasarens/rentmonitor-server-loopback.svg?style=svg)](https://circleci.com/gh/mathiasarens/rentmonitor-server-loopback)

The rent monitor server API.

The default configuration uses a postgresql database. But any SQL database
supported by loopback can be used.

In case you are using postgresql please run these commands to setup the
databases:

```
createuser $RDS_USERNAME -P
CREATE USER $RDS_USERNAME WITH ENCRYPTED PASSWORD $RDS_PASSWORD;
createuser rentmonitor_test -P

createdb rentmonitor_test --owner rentmonitor_test --username <user with createdb permissions>

createdb $RDS_DB_NAME --owner $RDS_USERNAME --username <user with createdb permissions>
CREATE DATABASE $RDS_DB_NAME OWNER $RDS_USERNAME;
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

CREATE ROLE $RDS_USERNAME WITH LOGIN PASSWORD $RDS_PASSWORD;
CREATE DATABASE $RDS_DB_NAME OWNER $RDS_USER;

#### Build docker image

docker build -t arm32v6/rentmonitor-server-loopback:1.0.1 .

#### Save docker image to file

docker save -o /tmp/rentmonitor-server-loopback-1.0.1.img arm32v6/rentmonitor-server-loopback:1.0.1

#### Copy image via ssh to Raspberry Pi0W

scp /tmp/rentmonitor-server-loopback-1.0.1.img $RENTMONITOR_DEPLOY_HOST:~/rentmonitor-server-loopback-1.0.1.img

#### Install image on Raspberry Pi0W

docker load -i rentmonitor-server-loopback-1.0.1.img

#### Start container on Raspberry Pi0W

docker run --network rentmonitor-network --name rentmonitor-server -e RDS_HOSTNAME -e RDS_PORT -e RDS_DB_NAME -e RDS_USERNAME -e RDS_PASSWORD -e RENTMONITOR_DB_ENCRYPTION_SECRET -e RENTMONITOR_DB_ENCRYPTION_SALT -e RENTMONITOR_JWT_SECRET -p 3000:3000 -d arm32v6/rentmonitor-server-loopback:1.0.1

#### Restore database dump

cat rentmonitor_dump.sql | docker exec -i postgresdb psql -U $RDS_USERNAME

#### Create AWS Elastic Beanstalk environment

eb create --region us-east-1 --elb-type application --database --database.engine postgres --database.user $RDS_USERNAME --database.password $RDS_PASSWORD --envvars RENTMONITOR_DB_ENCRYPTION_SECRET=$RENTMONITOR_DB_ENCRYPTION_SECRET,RENTMONITOR_DB_ENCRYPTION_SALT=$RENTMONITOR_DB_ENCRYPTION_SALT,RENTMONITOR_JWT_SECRET=$RENTMONITOR_JWT_SECRET

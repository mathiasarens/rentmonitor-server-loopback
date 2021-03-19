#!/bin/zsh
VERSION=$(npx -c 'echo "$npm_package_version"')
echo $VERSION
docker build -t arm32v6/rentmonitor-server-loopback:$VERSION .
docker save -o /tmp/rentmonitor-server-loopback-$VERSION.img arm32v6/rentmonitor-server-loopback:$VERSION
scp /tmp/rentmonitor-server-loopback-$VERSION.img $DEPLOY_HOST:~/
ssh $DEPLOY_HOST "docker stop rentmonitor-server && docker rm rentmonitor-server && docker load -i rentmonitor-server-loopback-$VERSION.img && docker run --network rentmonitor-network --name rentmonitor-server -e RENTMONITOR_DB_HOST -e RENTMONITOR_DB_PORT -e RENTMONITOR_DB_NAME -e RENTMONITOR_DB_USER -e RENTMONITOR_DB_PASSWORD -e RENTMONITOR_DB_ENCRYPTION_SECRET -e RENTMONITOR_DB_ENCRYPTION_SALT -e RENTMONITOR_JWT_SECRET -p 3000:3000 -d arm32v6/rentmonitor-server-loopback:$VERSION"

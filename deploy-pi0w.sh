#!/bin/zsh
SECONDS=0
VERSION=$(npx -c 'echo "$npm_package_version"')
echo $VERSION
docker build -f Dockerfile.pi0w -t arm32v6/rentmonitor-server-loopback:$VERSION .
docker save -o /tmp/rentmonitor/arm32v6/rentmonitor-server-loopback-$VERSION.img arm32v6/rentmonitor-server-loopback:$VERSION
scp /tmp/rentmonitor/arm32v6/rentmonitor-server-loopback-$VERSION.img $RENTMONITOR_DEPLOY_HOST:~/
ssh $RENTMONITOR_DEPLOY_HOST "echo 'Stopping rentmonitor-server...' && docker stop rentmonitor-server && echo 'Removing rentmonitor-server...' && docker rm rentmonitor-server && echo 'Loading rentmonitor-server...' && docker load -i rentmonitor-server-loopback-$VERSION.img && echo 'Running rentmonitor-server...' && docker run --network rentmonitor-network --name rentmonitor-server -e RENTMONITOR_DB_HOST -e RENTMONITOR_DB_PORT -e RENTMONITOR_DB_USER -e RENTMONITOR_DB_PASSWORD -e RENTMONITOR_DB_ENCRYPTION_SECRET -e RENTMONITOR_DB_ENCRYPTION_SALT -e RENTMONITOR_JWT_SECRET -p 3000:3000 -d --restart unless-stopped arm32v6/rentmonitor-server-loopback:$VERSION && echo 'Pruning unused images...' && docker image prune -af && echo Successfully deployed rentmonitor-server:$VERSION"
DURATION=$SECONDS
echo "rentmonitor-server:$VERSION deployment took $(($DURATION / 60)) minutes and $(($DURATION % 60)) seconds."

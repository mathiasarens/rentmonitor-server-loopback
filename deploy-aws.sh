#!/bin/zsh
SECONDS=0
VERSION=$(npx -c 'echo "$npm_package_version"')
echo $VERSION
docker build -t amd64/rentmonitor-server-loopback:$VERSION .
docker save -o /tmp/rentmonitor-server-loopback-$VERSION.img amd64/rentmonitor-server-loopback:$VERSION

DURATION=$SECONDS
echo "rentmonitor-server:$VERSION deployment took $(($DURATION / 60)) minutes and $(($DURATION % 60)) seconds."

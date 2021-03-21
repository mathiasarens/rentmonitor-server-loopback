#!/bin/bash
NOW=`date +%d-%m-%Y"_"%H_%M_%S`
docker exec -t $BACKUP_DB pg_dumpall -c -U $BACKUP_DB_USER > backup/rentmonitor-$NOW.sql
scp -i ~/.ssh/$BACKUP_HOST ~/backup/rentmonitor-$NOW.sql $BACKUP_HOST:~

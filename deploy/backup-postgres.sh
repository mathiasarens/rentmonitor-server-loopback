#!/bin/bash
NOW=`date +%d-%m-%Y"_"%H_%M_%S`
docker exec -t $BACKUP_DB pg_dump -c -U $BACKUP_DB_USER rentmonitor > ~/backup/rentmonitor-$NOW.sql
scp -i ~/.ssh/$BACKUP_HOST ~/backup/rentmonitor-$NOW.sql $BACKUP_HOST:~

#!/bin/bash
docker exec -t postgresdb pg_dumpall -c -U postgres > backup/rentmonitor-`date +%d-%m-%Y"_"%H_%M_%S`.sql

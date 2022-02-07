#!/bin/bash
PUBLIC_IP=$(curl --silent https://checkip.amazonaws.com)

echo "Updating security group $RDS_BACKUP_SECURITY_GROUP_NAME to allow access from $PUBLIC_IP"
aws ec2 authorize-security-group-ingress --group-name $RDS_BACKUP_SECURITY_GROUP_NAME --protocol tcp --port $RDS_BACKUP_PORT --cidr $PUBLIC_IP/32
FILE=rentmonitor-$(date +%F_%H-%M-%S)-rds.sql
echo "Creating $RDS_BACKUP_DB_NAME dump to $FILE"
PGPASSWORD=$RDS_BACKUP_PASSWORD pg_dump -c -h $RDS_BACKUP_HOSTNAME -U $RDS_BACKUP_USERNAME -f $FILE $RDS_BACKUP_DB_NAME
echo "Updating security group $RDS_BACKUP_SECURITY_GROUP_NAME to revoke access from $PUBLIC_IP"
aws ec2 revoke-security-group-ingress --group-name $RDS_BACKUP_SECURITY_GROUP_NAME --protocol tcp --port $RDS_BACKUP_PORT --cidr $PUBLIC_IP/32
echo "Importing $FILE to local db $RDS_DB_NAME"
psql -f $FILE --host $RDS_HOSTNAME --port $RDS_PORT --username $RDS_USERNAME --dbname $RDS_DB_NAME

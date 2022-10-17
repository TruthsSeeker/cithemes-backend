#!/bin/bash
if [ ! -f .env ]
  then
    export $(cat .env | xargs)
fi

psql -h localhost -d $DB_NAME -U $DB_USER -p $DB_PORT -a -f ./src/db/scripts/reset_playlists.sql
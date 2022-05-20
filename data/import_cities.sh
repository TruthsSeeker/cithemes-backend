#!/usr/bin/env bash

psql -U postgres -d cithemes -c "\copy cities(id, name, name_ascii, lat, lng, country, iso2, name_alt, capital, population) FROM 'data/cities.csv' DELIMITER ',' CSV HEADER;"
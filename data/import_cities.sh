#!/usr/bin/env bash

psql -U postgres -d cithemes -c "\copy cities(id, name, name_ascii, lat, lng, country, iso2, name_alt, capital, population) FROM 'data/cities.csv' DELIMITER ',' CSV HEADER;"
psql -U postgres -d cithemes -c "CREATE INDEX ON cities USING GIST (center);"
psql -U postgres -d cithemes -c "UPDATE cities SET center = point(lng, lat);"
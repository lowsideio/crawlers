#!/bin/bash
sqlite3 ./data/db.sqlite <<!
.headers on
.mode csv
.import links.csv Links
update "Links" set last_visited = NULL where last_visited = '';
.exit
!

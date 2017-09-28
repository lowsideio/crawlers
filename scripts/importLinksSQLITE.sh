#!/bin/bash
sqlite3 ./data/db.sqlite <<!
.headers on
.mode csv
.import links.csv Links
.exit
!

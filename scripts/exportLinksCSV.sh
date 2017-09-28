#!/bin/bash
sqlite3 ./data/db.sqlite <<!
.headers on
.mode csv
.output links.csv
select * from "Links";
!

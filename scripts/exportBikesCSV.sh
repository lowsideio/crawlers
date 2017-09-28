#!/bin/bash
sqlite3 ./data/db.sqlite <<!
.headers on
.mode csv
.output motorcycles.csv
select * from "Motorcycles";
!

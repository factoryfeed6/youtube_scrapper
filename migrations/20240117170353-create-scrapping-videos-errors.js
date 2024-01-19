
"use strict";

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.runSql(`
  CREATE TABLE scrapping_error (
    id SERIAL PRIMARY KEY,
    unique_id text NOT NULL DEFAULT generate_object_id(),
    business_id integer NOT NULL REFERENCES businesses(id),
    job_id integer NOT NULL REFERENCES scrapping_jobs(id),
    csv_uploaded_id integer NOT NULL REFERENCES csv(id), -- Corrected line
    error_message text,
    error_time text, 
    resolved boolean,
    is_disabled boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp without time zone DEFAULT timezone('utc'::text, now())
  );
  
`);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};


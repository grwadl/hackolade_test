const QueryEnum = {
  GET_TABLES: `SELECT * FROM system_schema.tables WHERE keyspace_name=?`,
  GET_SCHEMA:
    "SELECT * FROM system_schema.columns WHERE keyspace_name = ? AND table_name = ?",
};

const PrimitiveTypes = {
  text: "string",
  varchar: "string",
  timestamp: "string",
  time: "string",
  inet: "string",
  date: "string",
  ascii: "string",
  timeuuid: "string",
  uuid: "string",
  bigint: "number",
  boolean: "boolean",
  counter: "number",
  decimal: "number",
  double: "number",
  float: "number",
  int: "number",
  smallint: "number",
  tinyint: "number",
  varint: "number",
};

const ds = {
  ARRAY: "array",
  OBJECT: "object",
};

const ComplexTypeRegexp = {
  ALL: new RegExp(/list<|set<|map</g),
  JSON: new RegExp(/{|}/g),
};

const errorEnum = {
  CONNECTION: "Can't connect to cassandra db.",
  EMPY_TABLE: `There is no data in one of your tables. Please provide at least 1 row to`,
  EMPTY_DB: "Your db is empty!",
};

export { ComplexTypeRegexp, PrimitiveTypes, QueryEnum, errorEnum, ds };

import { dbConfigs } from "./configs.js";

const QueryEnum = {
  GET_TABLES: `SELECT * FROM system_schema.tables WHERE keyspace_name=?`,
  GET_SCHEMA:
    "SELECT * FROM system_schema.columns WHERE keyspace_name = ? AND table_name = ?",
};

const tableExporter = Object.freeze({
  async processTable({ table_name }, client) {
    const { rows } = await client.rawQuery(QueryEnum.GET_SCHEMA, [
      dbConfigs.KEYSPACE,
      table_name,
    ]);
    console.log(rows);
  },

  async jsonSchemaParser() {},
});

export { QueryEnum, tableExporter };

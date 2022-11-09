import { dbConfigs } from "./configs.js";

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

const ComplexTypeRegexp = {
  ALL: new RegExp(/list<|set<|map</g),
  LIST: new RegExp(/list/g),
  SET: new RegExp(/set/g),
  MAP: new RegExp(/map/g),
  JSON: new RegExp(),
};

const isDataJsonSerialized = ({ exampleValue }) =>
  typeof exampleValue === "string" &&
  exampleValue.match(ComplexTypeRegexp.JSON); //check for {}
const isDataComplex = ({ type, exampleValue }) =>
  type.match(ComplexTypeRegexp.ALL) || typeof exampleValue === "object";
const isDataPrimitiveString = ({ type }) =>
  PrimitiveTypes[type] && PrimitiveTypes[type] === "string";

const tableExporter = Object.freeze({
  async processTable({ table_name }, client) {
    const { rows: tableSchema } = await client.rawQuery(QueryEnum.GET_SCHEMA, [
      dbConfigs.KEYSPACE,
      table_name,
    ]);

    const {
      rows: [tableData],
    } = await client.getOne(table_name);

    if (!tableData)
      throw new Error(
        `There is no data in your ${table_name} table. Please provide at least 1 row.`
      );

    const tableSchemaAndData = tableSchema.map((col) => ({
      ...col,
      exampleValue: tableData[col.column_name],
    }));

    const jsonSchema = {};
    this.jsonSchemaParser(tableSchemaAndData, jsonSchema);
    return jsonSchema;
  },

  jsonSchemaParser(table, schema) {
    table?.forEach((col) => {
      if (!isDataPrimitiveString(col)) {
        return !isDataComplex(col)
          ? (schema[col.column_name] = { type: col.type })
          : this.complexTypeDetecter(
              { ...col, fieldName: col.column_name },
              schema
            );
        //TODO: complex data
      } else {
        if (!isDataJsonSerialized(col))
          return (schema[col.column_name] = { type: col.type });

        try {
          const parsedJSON = JSON.parse(col.exampleValue);
        } catch (e) {}
      }
    });
  },
  complexTypeDetecter({ exampleValue, fieldName }, schema) {
    if (Array.isArray(exampleValue)) {
      const isContainingPrimitive = exampleValue[0] !== Object(exampleValue[0]);
      schema[fieldName] = {
        type: "array",
        items: {},
      };
      schema[fieldName].items = {
        type: isContainingPrimitive
          ? typeof exampleValue[0]
          : this.complexTypeDetecter(
              {
                exampleValue: exampleValue[0],
                fieldName: Array.isArray(exampleValue[0])
                  ? "items"
                  : "properties",
              },
              schema.items
            ),
      };
      return schema;
    }

    const nestedFields = Object.keys(exampleValue).map((key) => ({
      value: exampleValue[key],
      key,
    }));

    let nestedFieldsSchema = {};
    nestedFields.forEach(({ key, value }) => {
      if (value !== Object(value))
        return (nestedFieldsSchema[key] = { type: typeof value });
      return this.complexTypeDetecter(
        {
          exampleValue: value,
          fieldName: Array.isArray(value) ? "items" : "properties",
        },
        schema[fieldName]
      );
    });

    schema[fieldName] = {
      type: "object",
      properties: nestedFieldsSchema,
    };
  },
});

export { QueryEnum, tableExporter };

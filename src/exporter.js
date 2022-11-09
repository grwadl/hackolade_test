import { QueryEnum, errorEnum, ds, PrimitiveTypes } from "./enums.js";
import { isDataPrimitiveString, isDataComplex, tryParseJson, isObject } from "./helpers.js";

const tableExporter = Object.freeze({
  async processTable({ table_name, keyspace }, client) {
    const { rows: tableSchema } = await client.rawQuery(QueryEnum.GET_SCHEMA, [keyspace, table_name]);

    const {
      rows: [tableData]
    } = await client.getOne(table_name);

    if (!tableData) throw new Error(`${errorEnum.EMPY_TABLE} ${table_name} table`);

    const tableSchemaAndData = tableSchema.map((col) => ({
      ...col,
      exampleValue: tableData[col.column_name]
    }));

    const jsonSchema = { type: ds.OBJECT, title: table_name, properties: {} };
    this.jsonSchemaParser(tableSchemaAndData, jsonSchema.properties);
    return jsonSchema;
  },

  jsonSchemaParser(table, schema) {
    table?.forEach((col) => {
      if (!isDataPrimitiveString(col))
        return !isDataComplex(col)
          ? (schema[col.column_name] = { type: PrimitiveTypes[col.type] })
          : this.complexTypeDetecter({ ...col, fieldName: col.column_name }, schema);
      else {
        const json = tryParseJson(col.exampleValue);
        return !json
          ? (schema[col.column_name] = { type: PrimitiveTypes[col.type] })
          : this.complexTypeDetecter({ exampleValue: col.exampleValue, fieldName: col.column_name }, schema);
      }
    });
  },
  complexTypeDetecter({ exampleValue, fieldName }, schema) {
    if (!schema[fieldName]) schema[fieldName] = {};
    if (Array.isArray(exampleValue)) {
      schema[fieldName] = {
        type: ds.ARRAY,
        items: {}
      };

      this.complexTypeDetecter(
        {
          exampleValue: exampleValue[0],
          fieldName: "items"
        },
        schema[fieldName]
      );

      return schema;
    } else if (isObject(exampleValue)) {
      const nestedFields = Object.keys(exampleValue).map((key) => ({
        value: exampleValue[key],
        key
      }));

      const nestedFieldsSchema = {};
      nestedFields.forEach(({ key, value }) => {
        const json = tryParseJson(value);
        if (json) {
          nestedFieldsSchema[key] = { type: ds.OBJECT };
          return this.complexTypeDetecter({ exampleValue: json, fieldName: key }, nestedFieldsSchema);
        }
        if (!isObject(value)) return (nestedFieldsSchema[key] = { type: typeof value });
        nestedFields[key] = { type: ds.OBJECT };
        return this.complexTypeDetecter(
          {
            exampleValue: value,
            fieldName: key
          },
          nestedFieldsSchema
        );
      });

      return (schema[fieldName] = {
        type: ds.OBJECT,
        properties: nestedFieldsSchema
      });
    }
    const json = tryParseJson(exampleValue);
    return !json
      ? (schema[fieldName] = {
          type: typeof exampleValue
        })
      : this.complexTypeDetecter({ exampleValue: json, fieldName }, schema);
  }
});

export { tableExporter };

import cassandraDriver from "cassandra-driver";
import { dbConfigs } from "./configs.js";
import { tableExporter } from "./src/exporter.js";
import { QueryEnum, errorEnum } from "./src/enums.js";
import { ORM } from "./src/orm.js";
import fs from "fs";

const casandra = new cassandraDriver.Client({
  contactPoints: [...dbConfigs.HOSTNAME],
  localDataCenter: dbConfigs.DATACENTER,
  keyspace: dbConfigs.KEYSPACE,
});

const fileName = "result.json";

const client = new ORM(casandra);

try {
  await client.connect();
  const res = await client.rawQuery(
    QueryEnum.GET_TABLES,
    [dbConfigs.KEYSPACE],
    {
      prepare: true,
    }
  );
  if (!res?.rows || res.rows.length <= 0) throw new Error(errorEnum.EMPTY_DB);
  let resultSchemas = [];
  for (const tableName of res.rows) {
    const schema = await tableExporter.processTable(tableName, client);
    resultSchemas.push(schema);
  }
  resultSchemas = JSON.stringify(resultSchemas);
  fs.writeFileSync(fileName, resultSchemas);
} catch (e) {
  console.log(e ?? errorEnum.CONNECTION);
} finally {
  client.closeConnection();
}

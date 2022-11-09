import cassandraDriver from "cassandra-driver";
import dbConfigs from "./configs.js";
import { tableExporter } from "./src/exporter.js";
import { QueryEnum, errorEnum } from "./src/enums.js";
import { ORM } from "./src/orm.js";
import { fileFriter } from "./src/helpers.js";

const casandra = new cassandraDriver.Client({
  contactPoints: [...dbConfigs.HOSTNAME],
  localDataCenter: dbConfigs.DATACENTER,
  keyspace: dbConfigs.KEYSPACE,
});

const fileName = new URL("./result.json", import.meta.url).pathname;

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
    const schema = await tableExporter.processTable(
      { ...tableName, keyspace: dbConfigs.KEYSPACE },
      client
    );
    resultSchemas.push(schema);
  }
  fileFriter.write(resultSchemas, fileName);
} catch (e) {
  console.log(e ?? errorEnum.CONNECTION);
} finally {
  client.closeConnection();
}

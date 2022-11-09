import cassandraDriver from "cassandra-driver";
import { dbConfigs } from "./configs.js";
import { tableExporter, QueryEnum } from "./helpers.js";
import { ORM } from "./orm.js";
import fs from "fs";

const casandra = new cassandraDriver.Client({
  contactPoints: [...dbConfigs.HOSTNAME],
  localDataCenter: dbConfigs.DATACENTER,
  keyspace: dbConfigs.KEYSPACE,
});

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
  if (!res?.rows || res.rows.length <= 0) throw new Error("Your db is empty!");
  let resultSchemas = [];
  for (const tableName of res.rows) {
    const schema = await tableExporter.processTable(tableName, client);
    resultSchemas.push(schema);
  }
  resultSchemas = JSON.stringify(resultSchemas);
  fs.writeFileSync("result.json", resultSchemas);
} catch (e) {
  console.log(e);
} finally {
  client.closeConnection();
}

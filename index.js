import cassandraDriver from "cassandra-driver";
import { dbConfigs } from "./configs.js";
import { tableExporter, QueryEnum } from "./helpers.js";
import { ORM } from "./orm.js";

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

  for (const row of res.rows) {
    await tableExporter.processTable(row, client);
  }
} catch (e) {
  console.log(e);
} finally {
  client.closeConnection();
}

import cassandra from "cassandra-driver";
import { dbConfigs } from "./configs.js";

const query = `SELECT * FROM system_schema.tables WHERE keyspace_name = 'test';`;

const client = new cassandra.Client({
  contactPoints: [dbConfigs.HOSTNAME],
  localDataCenter: dbConfigs.DATACENTER,
  keyspace: dbConfigs.KEYSPACE,
});

client.connect(function (err) {});
client
  .execute(query)
  .then((res) => console.log(res.rows[0].table_name))
  .catch((e) => console.log(e));

import chai from "chai";
import cassandraDriver from "cassandra-driver";
import { ORM } from "../src/orm.js";
import { tableExporter } from "../src/exporter.js";
import { fileFriter } from "../src/helpers.js";
import dbConfigs from "../configs.js";

const expect = chai.expect;

let client;

const KEYSPACE_NAME = "hackolade_cassandra_test";
const TABLE_NAME = "test1";
const pathToJson = new URL("./test.results.json", import.meta.url).pathname;
const pathToMockedJson = new URL("./test.results.json", import.meta.url)
  .pathname;

//change this db schema, json shema(mocked.json) and mocked data to customize your test

const mockedSchema =
  "testset set<frozen<list<int>>>, id int primary key, testlist list <frozen<map<text, text>>>";

const mockedTableData = {
  testset: [
    [1, 2],
    [3, 4],
  ],
  id: 1,
  testlist: [
    {
      id: "uniqueId",
      json: JSON.stringify({
        obj: {
          id: "1 level deep",
          nested: { id: "2 level deep", var: [{ text: "some text" }] },
        },
      }),
    },
  ],
};

describe("testing app", () => {
  beforeEach(async () => {
    const casandra = new cassandraDriver.Client({
      contactPoints: dbConfigs.HOSTNAME,
      localDataCenter: dbConfigs.DATACENTER,
    });

    client = new ORM(casandra);
    client.connect();
  });

  it("should create keyspace", async () => {
    const res = await client.rawQuery(
      `CREATE  KEYSPACE IF NOT EXISTS ${KEYSPACE_NAME} WITH REPLICATION = {'class': 'SimpleStrategy', 'replication_factor': 1};`
    );
    expect(res).to.exist;
  });

  it("should add table test(see the scheme below)", async () => {
    const res = await client.rawQuery(
      `create table IF NOT EXISTS ${KEYSPACE_NAME}.${TABLE_NAME} (${mockedSchema});`
    );
    expect(res).to.be.a("object");
  });

  it("should insert values", async () => {
    const res = await client.rawQuery(
      `insert into ${KEYSPACE_NAME}.${TABLE_NAME} JSON '${JSON.stringify(
        mockedTableData
      )}'`
    );
    expect(res).to.exist;
  });

  it("should export scheme correctly", async () => {
    await client.rawQuery(`USE ${KEYSPACE_NAME}`);
    const res = await tableExporter.processTable(
      { table_name: `${TABLE_NAME}`, keyspace: dbConfigs.KEYSPACE },
      client
    );
    fileFriter.write(res, pathToJson);
    const originalData = fileFriter.read(pathToJson);
    const mockedData = fileFriter.read(pathToMockedJson);
    expect(originalData).to.be.equal(mockedData);
  });
});

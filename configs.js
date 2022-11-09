const dbConfigs = {
  HOSTNAME: ["127.0.0.1"],
  DATACENTER: "datacenter1",
  KEYSPACE: "test_set",
};

const testDbConfigs = { ...dbConfigs, KEYSPACE: "hackolade_cassandra_test" };

export default process.env.NODE_ENV === "test" ? testDbConfigs : dbConfigs;

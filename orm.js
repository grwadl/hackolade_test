// change this if new db
class ORM {
  constructor(_dbInstance) {
    this.dbInstance = _dbInstance;
  }
  connect(configs = {}) {
    return this.dbInstance.connect();
  }
  rawQuery(query, params, options = {}) {
    return this.dbInstance.execute(query, params, options);
  }
  closeConnection() {
    return this.dbInstance.shutdown();
  }
}

export { ORM };

// change this methods if to swap db
class ORM {
  constructor(_dbInstance) {
    this.dbInstance = _dbInstance;
  }
  connect() {
    return this.dbInstance.connect();
  }
  rawQuery(query, params, options = {}) {
    return this.dbInstance.execute(query, params, options);
  }
  getOne(entity) {
    const query = `SELECT * FROM ${entity}`;
    return this.rawQuery(query);
  }
  closeConnection() {
    return this.dbInstance.shutdown();
  }
}

export { ORM };

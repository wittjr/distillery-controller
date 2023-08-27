const sqlite3 = require('sqlite3').verbose();
import l from '../../common/logger';

class DistilleryDatabase {
  constructor() {
    let db_location = './server/data/distillery.db';
    // db_location = ':memory:';
    this.db = new sqlite3.Database(db_location, (err) => {
      if (err) {
        return l.error(err.message);
      }
      l.info('Connected to the ' + db_location + ' SQlite database.');
    });

    this.db.serialize(() => {
      this.db.run(`CREATE TABLE IF NOT EXISTS timedata (
        id char(36) PRIMARY KEY,
        batchID char(36),
        timestamp integer,
        temperature real,
        operation text
      )`);
      this.db.run(`CREATE TRIGGER IF NOT EXISTS AutoGenerateUUID_timedata
        AFTER INSERT ON timedata
        FOR EACH ROW
        WHEN(NEW.id IS NULL)
        BEGIN
          UPDATE timedata SET id = (select hex( randomblob(4)) || '-' || hex( randomblob(2))
             || '-' || '4' || substr( hex( randomblob(2)), 2) || '-'
             || substr('AB89', 1 + (abs(random()) % 4) , 1)  ||
             substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6)) ) WHERE rowid = NEW.rowid;
        END;
      `);
      this.db.run(`CREATE TABLE IF NOT EXISTS rundata (
        id char(36) PRIMARY KEY,
        operation text,
        starttime integer,
        endtime integer,
        input text,
        result text
      )`);
      this.db.run(`CREATE TRIGGER IF NOT EXISTS AutoGenerateUUID_rundata
        AFTER INSERT ON rundata
        FOR EACH ROW
        WHEN(NEW.id IS NULL)
        BEGIN
          UPDATE rundata SET id = (select hex( randomblob(4)) || '-' || hex( randomblob(2))
             || '-' || '4' || substr( hex( randomblob(2)), 2) || '-'
             || substr('AB89', 1 + (abs(random()) % 4) , 1)  ||
             substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6)) ) WHERE rowid = NEW.rowid;
        END;
      `);
      this.db.run(`CREATE TABLE IF NOT EXISTS stills (
        id char(36) PRIMARY KEY,
        type text,
        status text,
        controls clob
      )`);
      this.db.run(`CREATE TRIGGER IF NOT EXISTS AutoGenerateUUID_stills
        AFTER INSERT ON stills
        FOR EACH ROW
        WHEN(NEW.id IS NULL)
        BEGIN
          UPDATE stills SET id = (select hex( randomblob(4)) || '-' || hex( randomblob(2))
             || '-' || '4' || substr( hex( randomblob(2)), 2) || '-'
             || substr('AB89', 1 + (abs(random()) % 4) , 1)  ||
             substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6)) ) WHERE rowid = NEW.rowid;
        END;
      `);
    });
  }

  createRun(runData) {
    l.debug(`DB: Create run ${JSON.stringify(runData)}`);
    l.debug(`run type ${runData.type}`);
    return new Promise((resolve, reject) => {
      let db = this.db;
      let query = `INSERT INTO rundata (operation, starttime, input, endtime, result) VALUES ('${
        runData.type
      }','${runData.startTime}','${JSON.stringify(runData)}', '', '')`;
      l.debug(`sql: ${query}`);
      db.run(query, function (err) {
        if (err) {
          l.error(err.message);
          reject(err.message);
        }
        l.debug(JSON.stringify(this));
        db.get(
          'SELECT * FROM rundata WHERE rowid=?',
          [this.lastID],
          function (err, row) {
            l.debug(row);
            resolve({ id: row.id });
          }
        );
      });
    });
  }

  finishRun(id, runData) {
    l.debug(`DB: Finish run ${JSON.stringify(runData)}`);
    return new Promise((resolve, reject) => {
      let db = this.db;
      let query = `UPDATE rundata SET endtime = '${
        runData.endTime
      }', result = '${JSON.stringify(runData.result)}' WHERE id = '${id}'`;
      l.debug(`sql: ${query}`);
      db.run(query, function (err) {
        if (err) {
          l.error(err.message);
          reject(err.message);
        }
        l.debug(JSON.stringify(this));
        if (this.changes == 1) {
          resolve();
        } else {
          resolve({ message: 'no changes were made' });
        }
      });
    });
  }

  getRuns(batchID = undefined) {
    l.debug(`getRuns: ${batchID}`);
    return new Promise((resolve, reject) => {
      let rows = [];
      let query = `SELECT * FROM rundata`;
      if (batchID) {
        query += ` WHERE id='${batchID}' ORDER BY starttime ASC`;
      }
      l.debug(`sql: ${query}`);
      this.db.serialize(() => {
        this.db.each(
          query,
          (err, row) => {
            if (err) {
              l.error(err.message);
              reject(err.message);
            }
            let rowObj = Object.assign({}, row);
            rowObj.input = JSON.parse(row.input);
            if (row.result && row.result.length > 0) {
              rowObj.result = JSON.parse(row.result);
            }
            rows.push(rowObj);
          },
          () => {
            resolve(rows);
          }
        );
      });
    });
  }

  getStills(stillType = undefined, id = undefined) {
    l.debug(`getStills ${id}`);
    return new Promise((resolve, reject) => {
      let rows = [];
      let query = `SELECT * FROM stills`;
      let sql_where = [];
      if (stillType) {
        sql_where.push(`type='${stillType}'`);
      }
      if (id) {
        sql_where.push(`id='${id}'`);
      }
      if (sql_where.length > 0) {
        query += ` WHERE ${sql_where.join(' AND ')}`;
      }
      l.debug(`sql: ${query}`);
      this.db.serialize(() => {
        this.db.each(
          query,
          (err, row) => {
            if (err) {
              l.error(err.message);
              reject(err.message);
            }
            let rowObj = Object.assign({}, row);
            // l.error(rowObj);
            // l.debug(row);
            // rowObj.input = JSON.parse(row.input);
            // rowObj.result = JSON.parse(row.result);
            // l.debug(rowObj);
            rows.push(rowObj);
          },
          () => {
            resolve(rows);
          }
        );
      });
    });
  }

  createStill(type, controls) {
    l.debug('createStill ' + type);
    return new Promise((resolve, reject) => {
      let db = this.db;
      let query =
        `INSERT INTO stills (type, status, controls) VALUES ('` +
        type +
        `', 'idle', '` +
        controls +
        `')`;
      l.debug(`sql: ${query}`);
      db.run(query, function (err) {
        if (err) {
          l.error(err.message);
          reject(err.message);
        }
        l.debug(JSON.stringify(this));
        db.get(
          'SELECT * FROM stills WHERE rowid=?',
          [this.lastID],
          function (err, row) {
            l.debug(row);
            resolve({ id: row.id });
          }
        );
      });
    });
  }

  getRun(batchID = undefined, callback) {
    let rows = [];
    let query = 'SELECT * FROM rundata';
    if (batchID) {
      query += " WHERE batchID='" + batchID + "' ORDER BY starttime ASC";
    }
    this.db.serialize(() => {
      this.db.each(
        query,
        (err, row) => {
          if (err) {
            l.error(err.message);
          }
          let rowObj = Object.assign({}, row);
          rowObj.input = JSON.parse(row.input);
          rowObj.result = JSON.parse(row.result);
          rows.push(rowObj);
        },
        () => {
          callback(rows);
        }
      );
    });
  }

  writeStillTimepoint(timePointData, unitOperation) {
    l.debug('DB: Write time point ' + JSON.stringify(timePointData));
    this.db.serialize(() => {
      this.db.run(
        `INSERT INTO timedata (
        batchID,
        timestamp,
        temperature,
        operation
      ) VALUES ('` +
          timePointData.batchID +
          `','` +
          timePointData.epochtime +
          `',` +
          timePointData.temperature +
          `,'` +
          unitOperation +
          `')`
      );
    });
  }

  getTimePoints(batchID = undefined, callback) {
    let rows = [];
    let query = 'SELECT * FROM timedata';
    if (batchID) {
      query += " WHERE batchID='" + batchID + "' ORDER BY timestamp ASC";
    }
    this.db.serialize(() => {
      this.db.each(
        query,
        (err, row) => {
          if (err) {
            l.error(err.message);
          }
          rows.push(row);
        },
        () => {
          callback(rows);
        }
      );
    });
  }

  close() {
    this.db.close((err) => {
      if (err) {
        return l.error(err.message);
      }
      l.info('DB: Close the database connection.');
    });
  }

  all() {
    return Promise.resolve(this._data);
  }

  byId(id) {
    return Promise.resolve(this._data[id]);
  }

  insert(name) {
    const record = {
      id: this._counter,
      name,
    };

    this._counter += 1;
    this._data.push(record);

    return Promise.resolve(record);
  }
}

export default new DistilleryDatabase();

import l from '../../common/logger';
import db from './distillery.db.service';

class HistoryService {
  all() {
    l.info(`${this.constructor.name}.all()`);
    return db.getRuns();
  }

  byId(id) {
    l.info(`${this.constructor.name}.byId(${id})`);
    return db.getRuns(id);
  }

  create(data) {
    return db.createRun(data);
  }

  update(id, data) {
    return db.finishRun(id, data);
  }
}

export default new HistoryService();

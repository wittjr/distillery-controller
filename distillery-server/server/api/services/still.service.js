import l from '../../common/logger';
import db from './distillery.db.service';

class StillService {
  all(type) {
    l.info(`${this.constructor.name}.all() filter by ${type}`);
    return db.getStills(type);
  }

  byId(type, id) {
    l.info(`${this.constructor.name}.byId(${id})`);
    return db.getStills(type, id);
  }

  create(type, phidgets) {
    return db.createStill(type, phidgets);
  }
}

export default new StillService();

import StillService from '../../services/still.service';
import l from '../../../common/logger';

const stillType = 'pot';

export class Controller {
  all(req, res) {
    l.debug(`all ${stillType} stills`);
    StillService.all(stillType).then((r) => res.json(r));
  }

  byId(req, res) {
    l.debug(`${stillType} still byId`);
    StillService.byId(stillType, req.params.id).then((r) => {
      if (r) res.json(r);
      else res.status(404).end();
    });
  }

  create(req, res) {
    l.debug(`create ${stillType} still`);
    StillService.create(stillType, req.body.phidgets).then((r) =>
      res.status(201).location(`/api/v1/distillery/stills/${r.id}`).json(r)
    );
  }
}
export default new Controller();

import StillService from '../../services/still.service';
import l from '../../../common/logger';

export class Controller {
  all(req, res) {
    l.debug('all stills');
    if (req.query.type) {
      l.debug(`filtering by ${req.query.type}`);
    }
    StillService.all(req.query.type).then((r) => res.json(r));
  }

  byId(req, res) {
    l.debug('still byId');
    StillService.byId(req.query.type, req.params.id).then((r) => {
      if (r) res.json(r);
      else res.status(404).end();
    });
  }

  create(req, res) {
    l.debug('create still');
    StillService.create(req.body.type, req.body.controls).then((r) =>
      res.status(201).location(`/api/v1/distillery/stills/${r.id}`).json(r)
    );
  }
}
export default new Controller();

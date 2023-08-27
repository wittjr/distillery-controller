import HistoryService from '../../services/history.service';
import l from '../../../common/logger';

export class Controller {
  all(req, res) {
    l.debug('history all');
    HistoryService.all().then((r) => res.json(r));
  }

  byId(req, res) {
    l.debug('history byId');
    HistoryService.byId(req.params.id).then((r) => {
      if (r && Object.keys(r).length > 0) res.json(r);
      else res.status(404).end();
    });
  }

  create(req, res) {
    l.debug('history create');
    HistoryService.create(req.body).then((r) =>
      res.status(201).location(`/api/v1/distillery/batches/${r.id}`).json(r)
    );
  }

  update(req, res) {
    l.debug('history update');
    HistoryService.update(req.params.id, req.body).then((r) => {
      if (r && Object.keys(r).length > 0) res.status(400).json(r);
      else res.status(204).end();
    });
  }
}
export default new Controller();

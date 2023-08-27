import historyRouter from './api/controllers/history/router';
import stillRouter from './api/controllers/stills/router';
import potStillRouter from './api/controllers/stills/potStillRouter';
import fractionalStillRouter from './api/controllers/stills/fractionalStillRouter';

export default function routes(app) {
  app.use('/api/v1/distillery/stills/pot', potStillRouter);
  app.use('/api/v1/distillery/stills/fractional', fractionalStillRouter);
  app.use('/api/v1/distillery/batches', historyRouter);
  app.use('/api/v1/distillery/stills', stillRouter);
}

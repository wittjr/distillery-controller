import * as express from 'express';
import controller from './fractionalStillController';
import batchController from '../history/controller';

export default express
  .Router()
  .get('/', controller.all)
  .get('/:id', controller.byId)
  .post('/', controller.create)
  .get('/:id/batches', batchController.all)
  .post('/:id/batches', batchController.create)
  .get('/:id/batches/:batchId', batchController.byId)
  .put('/:id/batches/:batchId', batchController.update);

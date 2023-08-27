import * as express from 'express';
import controller from './potStillController';

export default express
  .Router()
  .get('/', controller.all)
  .get('/:id', controller.byId)
  .post('/', controller.create);

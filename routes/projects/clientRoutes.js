const express = require('express');

const clientController = require('../../controllers/projects/clientController');
const authMiddleware = require('../../middlewares/authMiddleware');

const router = express.Router();

router
  .route('/')
  .get(clientController.getAllClients)
  .post(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin', 'lead', 'manager', 'editor'),
    clientController.createClient
  );

router
  .route('/:id')
  .get(clientController.getClient)
  .patch(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin', 'lead', 'manager', 'editor'),
    clientController.updateClient
  )
  .delete(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin', 'lead', 'manager', 'editor'),
    clientController.deleteClient
  );

module.exports = router;

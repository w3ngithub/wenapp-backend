const express = require('express');

const projectTagController = require('../controllers/projectTagController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router
  .route('/')
  .get(projectTagController.getAllProjectTags)
  .post(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin', 'lead', 'manager', 'editor'),
    projectTagController.createProjectTag
  );

router
  .route('/:id')
  .get(projectTagController.getProjectTag)
  .patch(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin', 'lead', 'manager', 'editor'),
    projectTagController.updateProjectTag
  )
  .delete(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin', 'lead', 'manager', 'editor'),
    projectTagController.deleteProjectTag
  );

module.exports = router;

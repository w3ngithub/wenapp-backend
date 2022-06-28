const express = require('express');

const projectController = require('../../controllers/projects/projectController');
const timeLogRouter = require('../timelogs/timeLogRoutes');
const authMiddleware = require('../../middlewares/authMiddleware');

const router = express.Router();

router.use('/:projectId/timelogs', timeLogRouter);

router.route('/search/:term').get(projectController.searchProject);

router.route('/:projectId/totaltime').get(projectController.getTotalTimeSpent);

router
  .route('/:projectId/weeklytime')
  .get(projectController.getWeeklyTimeSpent);

router
  .route('/')
  .get(projectController.getAllProjects)
  .post(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin', 'lead', 'manager', 'editor'),
    projectController.createProject
  );

router
  .route('/:id')
  .get(projectController.getProject)
  .patch(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin', 'lead', 'manager', 'editor'),
    projectController.updateProject
  )
  .delete(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin', 'lead', 'manager'),
    projectController.deleteProject
  );

module.exports = router;

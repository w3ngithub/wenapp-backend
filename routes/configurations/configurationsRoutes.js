const express = require('express');

const configurationsController = require('../../controllers/configurations/configurationsController');

const router = express.Router();

router.get('/', configurationsController.getAllConfigurations);
router.patch('/update', configurationsController.updateConfiguration);
router.patch(
  '/update-latearrival-threshold',
  configurationsController.updateLateAttendanceThreshold
);

module.exports = router;

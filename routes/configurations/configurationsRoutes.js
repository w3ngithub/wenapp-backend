const express = require('express');

const configurationsController = require('../../controllers/configurations/configurationsController');

const router = express.Router();

router.patch('/update', configurationsController.updateConfiguration);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getContactInfo } = require('../controllers/configController');

router.get('/contact', getContactInfo);

module.exports = router;

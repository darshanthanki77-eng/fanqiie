const express = require('express');
const router = express.Router();
const { getTrailers, createTrailer } = require('../controllers/trailerController');

router.route('/')
    .get(getTrailers)
    .post(createTrailer);

module.exports = router;

const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');

router.post('/', resultController.submitVote);
router.get('/:user_id/:vote_id', resultController.getResultsByVoteId);

module.exports = router;

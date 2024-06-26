const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');

router.post('/', resultController.submitVote);
router.get('/:vote_id', resultController.getResultsByVoteId);
router.get('/export/:vote_id', resultController.exportVoteResults);

module.exports = router;

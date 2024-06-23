const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');

router.post('/', voteController.createVote);
router.get('/', voteController.getAllVotes);
router.get('/:vote_id', voteController.getVoteById);
router.put('/:vote_id', voteController.updateVote);
router.delete('/:vote_id', voteController.deleteVote);

module.exports = router;

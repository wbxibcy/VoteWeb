const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');

router.post('/', voteController.createVote);
router.get('/code/:vote_code', voteController.getVoteByCode);
router.get('/id/:vote_id', voteController.getVoteById);
router.get('/user/:user_id', voteController.getVotesByUserId);
router.put('/:vote_id', voteController.updateVote);
router.delete('/:vote_id', voteController.deleteVote);

module.exports = router;

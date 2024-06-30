const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');

router.post('/', voteController.createVoteWithOptions);
router.get('/code/:vote_code', voteController.getVoteByCode);
router.get('/user/:user_id', voteController.getVotesByUserId);
router.put('/:vote_id', voteController.updateVote);
router.delete('/:vote_id', voteController.deleteVote);


module.exports = router;

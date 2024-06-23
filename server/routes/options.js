const express = require('express');
const router = express.Router();
const optionController = require('../controllers/optionController');

router.post('/', optionController.addOption);
router.get('/:user_id/:vote_id/options', optionController.getOptionsByVoteId);
router.delete('/:user_id/:vote_id/options/:option_id', optionController.deleteOption);

module.exports = router;

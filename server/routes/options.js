const express = require('express');
const router = express.Router();
const optionController = require('../controllers/optionController');

router.post('/', optionController.addOption);
router.get('/:vote_id/options', optionController.getOptionsByVoteId);
router.delete('/:option_id', optionController.deleteOption);

module.exports = router;

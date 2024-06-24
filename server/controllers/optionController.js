const { executeSql } = require('../utils/mysql');

exports.addOption = async (req, res) => {
  const { user_id, vote_id, options } = req.body;

  try {
    // 检查 vote_id 是否属于 user_id
    const vote = await executeSql('SELECT * FROM votes WHERE vote_id = ? AND user_id = ?', [vote_id, user_id]);
    if (vote.length === 0) {
      return res.status(403).send('You are not authorized to add options to this vote');
    }

    const insertPromises = options.map(option =>
      executeSql('INSERT INTO vote_options (vote_id, option_title) VALUES (?, ?)', [
        vote_id,
        option.option_title
      ])
    );

    await Promise.all(insertPromises);

    res.status(201).send('Options added');
  } catch (err) {
    res.status(500).send(err);
  }
};


exports.getOptionsByVoteId = async (req, res) => {
    const { user_id, vote_id } = req.params;
  
    try {
      // 检查 vote_id 是否属于 user_id
      const vote = await executeSql('SELECT * FROM votes WHERE vote_id = ? AND user_id = ?', [vote_id, user_id]);
      if (vote.length === 0) {
        return res.status(403).send('You are not authorized to view options of this vote');
      }
  
      const results = await executeSql('SELECT * FROM vote_options WHERE vote_id = ?', [vote_id]);
      res.status(200).send(results);
    } catch (err) {
      res.status(500).send(err);
    }
  };
  

  exports.deleteOption = async (req, res) => {
    const { user_id, vote_id, option_id } = req.params;
  
    try {
      // 检查 vote_id 是否属于 user_id
      const vote = await executeSql('SELECT * FROM votes WHERE vote_id = ? AND user_id = ?', [vote_id, user_id]);
      if (vote.length === 0) {
        return res.status(403).send('You are not authorized to delete options for this vote');
      }
  
      // 检查 option_id 是否属于 vote_id
      const option = await executeSql('SELECT * FROM vote_options WHERE option_id = ? AND vote_id = ?', [option_id, vote_id]);
      if (option.length === 0) {
        return res.status(404).send('Option not found for the specified vote');
      }
  
      await executeSql('DELETE FROM vote_options WHERE option_id = ?', [option_id]);
      res.status(200).send('Option deleted');
    } catch (err) {
      res.status(500).send(err);
    }
  };
  

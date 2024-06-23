const { executeSql } = require('../mysql');

exports.addOption = async (req, res) => {
  const { vote_id, options } = req.body;

  try {
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
  const { vote_id } = req.params;

  try {
    const results = await executeSql('SELECT * FROM vote_options WHERE vote_id = ?', [vote_id]);
    res.status(200).send(results);
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.deleteOption = async (req, res) => {
  const { option_id } = req.params;

  try {
    await executeSql('DELETE FROM vote_options WHERE option_id = ?', [option_id]);
    res.status(200).send('Option deleted');
  } catch (err) {
    res.status(500).send(err);
  }
};

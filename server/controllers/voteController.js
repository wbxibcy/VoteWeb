const { executeSql } = require('../mysql');

exports.createVote = async (req, res) => {
    const { user_id, vote_title, vote_description, start_time, end_time, status, min_votes, max_votes } = req.body;
    const vote_code = generateRandomCode();

    try {
        const results = await executeSql(
            'INSERT INTO votes (user_id, vote_title, vote_description, start_time, end_time, status, min_votes, max_votes, vote_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [user_id, vote_title, vote_description, start_time, end_time, status, min_votes, max_votes, vote_code]
        );
        res.status(201).send({ vote_id: results.insertId, vote_code });
    } catch (err) {
        res.status(500).send(err);
    }
};

function generateRandomCode() {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';

    // 添加时间戳（精确到秒）作为前缀
    const timestamp = Math.floor(Date.now() / 1000).toString();
    code += timestamp;

    // 生成一个简单的哈希值（取余运算），作为后续随机字符的种子
    const hash = timestamp.split('').reduce((acc, char) => acc + parseInt(char), 0) % 100;

    // 生成随机字符作为后缀
    for (let i = 0; i < 4; i++) {  // 4位随机字符，加上时间戳前缀，总长度为 6
        const randomIndex = Math.floor(Math.random() * chars.length);
        code += chars[(randomIndex + hash) % chars.length];
    }

    return code;
}


exports.getVoteByCode = async (req, res) => {
  const { vote_code } = req.params;

  try {
    const voteResults = await executeSql('SELECT * FROM votes WHERE vote_code = ?', [vote_code]);
    if (voteResults.length === 0) return res.status(404).send('Vote not found');
    
    const vote = voteResults[0];
    const options = await executeSql('SELECT * FROM vote_options WHERE vote_id = ?', [vote.vote_id]);

    res.status(200).send({ vote, options });
  } catch (err) {
    res.status(500).send(err);
  }
};


exports.getVoteById = async (req, res) => {
  const { vote_id } = req.params;

  try {
    const voteResults = await executeSql('SELECT * FROM votes WHERE vote_id = ?', [vote_id]);
    if (voteResults.length === 0) return res.status(404).send('Vote not found');
    
    const vote = voteResults[0];
    const options = await executeSql('SELECT * FROM vote_options WHERE vote_id = ?', [vote_id]);

    res.status(200).send({ vote, options });
  } catch (err) {
    res.status(500).send(err);
  }
};


exports.updateVote = async (req, res) => {
    const { vote_id } = req.params;
    const { vote_title, vote_description, start_time, end_time, status, min_votes, max_votes } = req.body;

    try {
        await executeSql(
            'UPDATE votes SET vote_title = ?, vote_description = ?, start_time = ?, end_time = ?, status = ?, min_votes = ?, max_votes = ? WHERE vote_id = ?',
            [vote_title, vote_description, start_time, end_time, status, min_votes, max_votes, vote_id]
        );
        res.status(200).send('Vote updated');
    } catch (err) {
        res.status(500).send(err);
    }
};


exports.deleteVote = async (req, res) => {
    const { vote_id } = req.params;

    try {
        // 先删除与该投票相关的所有选项
        await executeSql('DELETE FROM vote_options WHERE vote_id = ?', [vote_id]);

        // 再删除投票
        await executeSql('DELETE FROM votes WHERE vote_id = ?', [vote_id]);

        res.status(200).send('Vote and its options deleted');
    } catch (err) {
        res.status(500).send(err);
    }
};

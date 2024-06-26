const { v4: uuidv4 } = require('uuid');
const { executeSql } = require('../utils/mysql');
const redisClient = require('../utils/redis');
redisClient.connect();

exports.submitVote = async (req, res) => {
  const { user_id, vote_id, options } = req.body;

  try {
    // Check if the user has already voted
    const userVoteKey = `vote:${vote_id}:user:${user_id}`;
    const hasVoted = await redisClient.exists(userVoteKey);

    if (hasVoted) {
      return res.status(400).send({ error: 'User has already voted for this poll.' });
    }

    const vote_time = new Date().toISOString();
    const result_id = uuidv4();
    await redisClient.hSet(`vote:${vote_id}:results`, result_id, JSON.stringify({ user_id, vote_time, options }));

    for (const option of options) {
      await redisClient.hIncrBy(`vote:${vote_id}`, `option:${option.option_id}`, 1);
    }

    // Mark the user as having voted
    await redisClient.set(userVoteKey, 'true');

    // 获取最新的投票结果
    const voteResults = await redisClient.hGetAll(`vote:${vote_id}`);
    const formattedResults = Object.entries(voteResults).map(([option, count]) => ({
      option_id: option.replace('option:', ''),
      count: parseInt(count)
    }));

    // 通过WebSocket广播最新结果
    req.wss.broadcast(JSON.stringify({ vote_id, results: formattedResults }));

    res.status(201).send({ result_id });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

exports.getResultsByVoteId = async (req, res) => {
  const { vote_id } = req.params;

  try {
    const voteResults = await redisClient.hGetAll(`vote:${vote_id}`);

    const formattedResults = Object.entries(voteResults).map(([option, count]) => ({
      option_id: option.replace('option:', ''),
      count: parseInt(count)
    }));

    // 输出格式化后的结果
    console.log(formattedResults);
    res.status(200).send(formattedResults);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};


exports.exportVoteResults = async (req, res) => {
  const { vote_id } = req.params;

  try {
    // 查询投票信息
    const voteQuery = `
      SELECT vote_id, vote_title, vote_description
      FROM votes
      WHERE vote_id = ?
    `;
    const voteResults = await executeSql(voteQuery, [vote_id]);

    // 检查投票信息是否为空
    if (voteResults.length === 0) {
      return res.status(404).json({ error: 'Vote not found.' });
    }

    const voteData = voteResults[0];

    // 查询投票选项数据
    const optionsQuery = `
      SELECT option_id, option_title
      FROM vote_options
      WHERE vote_id = ?
    `;
    const options = await executeSql(optionsQuery, [vote_id]);

    // 从Redis查询投票结果数据
    const resultsFromRedis = await redisClient.hGetAll(`vote:${vote_id}`);

    // 格式化投票结果数据
    const formattedResults = Object.entries(resultsFromRedis).map(([optionKey, count]) => {
      const optionId = parseInt(optionKey.replace('option:', ''));
      const optionData = options.find(opt => opt.option_id === optionId);
      return optionData
        ? { option_id: optionId, option_title: optionData.option_title, count: parseInt(count) }
        : { option_id: optionId, option_title: 'Unknown Option', count: parseInt(count) };
    });

    // 返回格式化后的数据
    const response = {
      vote_id: voteData.vote_id,
      vote_title: voteData.vote_title,
      vote_description: voteData.vote_description,
      results: formattedResults
    };

    res.status(200).json(response);
  } catch (err) {
    console.error('Error exporting vote results:', err);
    res.status(500).json({ error: 'Failed to export vote results.' });
  }
};

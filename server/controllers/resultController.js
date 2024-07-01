const { v4: uuidv4 } = require('uuid');
const { executeSql } = require('../utils/mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const redisClient = require('../utils/redis');
redisClient.connect();

exports.submitVote = async (req, res) => {
  const { user_id, vote_id, options } = req.body;
  const authUserId = req.user.id;

  if (user_id !== authUserId) {
    return res.status(403).send('User ID does not match the authenticated user');
  }

  try {
    const checkVoteQuery = `
            SELECT COUNT(*) as count FROM results WHERE user_id = ? AND vote_id = ?
        `;
    const checkVoteResult = await executeSql(checkVoteQuery, [user_id, vote_id]);
    const voteCount = checkVoteResult[0].count;

    if (voteCount > 0) {
      return res.status(400).send('User has already voted');
    }
    // 开始事务
    await executeSql('BEGIN');
    console.log('BEGIN TRANSACTION');

    // 插入投票结果到 MySQL 的 results 表
    const vote_time = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const result_id = uuidv4();
    const insertResultQuery = `
          INSERT INTO results (user_id, vote_id, vote_time)
          VALUES (?, ?, ?)
      `;

    // 执行结果插入
    const resultInsertion = await executeSql(insertResultQuery, [user_id, vote_id, vote_time]);
    const insertedResultId = resultInsertion.insertId;
    console.log('Result inserted with ID:', insertedResultId);

    // 逐行插入投票选项到 MySQL 的 result_details 表
    for (const option of options) {
      const optionInsertQuery = `
              INSERT INTO result_details (result_id, option_id)
              VALUES (?, ?)
          `;
      await executeSql(optionInsertQuery, [insertedResultId, option.option_id]);
    }
    console.log('Result details inserted successfully');

    // 提交 MySQL 事务
    await executeSql('COMMIT');
    console.log('COMMIT TRANSACTION');

    // 将投票结果存储到 Redis
    await redisClient.hSet(`vote:${vote_id}:results`, result_id, JSON.stringify({ user_id, vote_time, options }));

    // 更新 Redis 中投票选项的计数
    for (const option of options) {
      await redisClient.hIncrBy(`vote:${vote_id}`, `option:${option.option_id}`, 1);
    }

    // 获取最新的投票结果
    const voteResults = await redisClient.hGetAll(`vote:${vote_id}`);
    const formattedResults = Object.entries(voteResults).map(([option, count]) => ({
      option_id: option.replace('option:', ''),
      count: parseInt(count)
    }));

    // 通过 WebSocket 广播最新结果
    req.wss.broadcast(JSON.stringify({ vote_id, results: formattedResults }));

    res.status(201).send({ result_id });
  } catch (err) {
    console.error('Transaction error:', err);

    // 如果出错，回滚 MySQL 事务
    await executeSql('ROLLBACK');
    console.log('ROLLBACK TRANSACTION');

    res.status(500).send(err);
  }
};


exports.getResultsByVoteId = async (req, res) => {
  const { vote_id } = req.params;
  const token = req.headers.authorization;
  const user_id = parseInt(req.params.user_id);

  try {
    // Validate token and user_id
    const validToken = await validateToken(token, user_id);

    if (!validToken) {
      return res.status(403).send('Unauthorized: Invalid token or user');
    }

    // Retrieve vote details from MySQL
    const voteQuery = `
      SELECT * FROM votes WHERE vote_id = ? AND user_id = ?
    `;
    const [voteResults] = await executeSql(voteQuery, [vote_id, user_id]);

    if (!voteResults) {
      return res.status(404).send('Vote not found');
    }

    // Retrieve vote options from MySQL
    const optionsQuery = `
      SELECT * FROM vote_options WHERE vote_id = ?
    `;
    const options = await executeSql(optionsQuery, [vote_id]);

    // Retrieve vote results from Redis
    const voteResultsRedis = await redisClient.hGetAll(`vote:${vote_id}`);
    const formattedResults = Object.entries(voteResultsRedis).map(([option, count]) => ({
      option_id: option.replace('option:', ''),
      count: parseInt(count)
    }));

    // Construct response object
    const response = {
      vote: {
        vote_id: voteResults.vote_id,
        user_id: user_id,
        vote_title: voteResults.vote_title,
        vote_description: voteResults.vote_description,
        start_time: voteResults.start_time,
        end_time: voteResults.end_time,
        status: voteResults.status,
        min_votes: voteResults.min_votes,
        max_votes: voteResults.max_votes,
        vote_code: voteResults.vote_code
      },
      options: options,
      results: formattedResults
    };

    res.status(200).send(response);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
};

// Function to validate token
async function validateToken(token, user_id) {
  try {
    // Extract token without 'Bearer' prefix if present
    const cleanToken = token.replace('Bearer ', '');
    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
    return decoded.id === user_id;
  } catch (err) {
    return false;
  }
}
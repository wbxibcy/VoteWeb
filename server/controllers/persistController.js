const { executeSql } = require('../utils/mysql');
const redisClient = require('../utils/redis');

const persistDataToMySQL = async () => {
  try {
    // 获取 Redis 中的数据
    const keys = await redisClient.keys('vote:*:results');
    console.log(`Found ${keys.length} vote result keys in Redis.`);

    for (const key of keys) {
      const vote_id = key.split(':')[1];
      console.log(`Processing vote_id: ${vote_id}`);

      const results = await redisClient.hGetAll(key);

      for (const result_id in results) {
        const { user_id, vote_time, options } = JSON.parse(results[result_id]);
        console.log({ user_id, vote_time, options });
        // 设置时间为 "Unknown" 如果 vote_time 不存在
        const vote_time_mysql = vote_time ? new Date(vote_time).toISOString().slice(0, 19).replace('T', ' ') : 'Unknown';

        // 检查 user_id 是否存在且有效
        if (!user_id) {
          console.log(`Skipping.`);
          continue; // 跳过当前循环
        }

        // 检查 Redis 中是否已经设置了持久化标记
        const isPersistedInRedis = await redisClient.hExists(key, `${result_id}:persisted`);

        if (!isPersistedInRedis) {
          // 检查 user_id 在 MySQL 中是否存在
          const userQuery = 'SELECT * FROM users WHERE user_id = ?';
          const userCheck = await executeSql(userQuery, [user_id]);

          if (userCheck.length === 0) {
            console.log(`User with user_id ${user_id} does not exist in the database. Skipping persistence.`);
            continue; // 跳过当前循环
          }
          
          // 在 MySQL 中持久化数据
          const insertResult = await executeSql(
            'INSERT INTO results (user_id, vote_id, vote_time) VALUES (?, ?, ?)',
            [user_id, vote_id, vote_time_mysql]
          );
          const new_result_id = insertResult.insertId;
          console.log(new_result_id);

          // 插入每个选项的数据到 MySQL
          for (const option of options) {
            await executeSql(
              'INSERT INTO result_details (result_id, option_id) VALUES (?, ?)',
              [new_result_id, option.option_id]
            );
          }

          // 在 Redis 中设置持久化标记
          console.log("要做标记了噢");
          await redisClient.hSet(key, `${result_id}:persisted`, 'true');

          // 记录插入操作日志
          console.log(`Inserted result ${result_id} into MySQL and marked as persisted in Redis.`);
        } else {
          // 如果 Redis 中已经设置了持久化标记，则跳过插入操作
          console.log(`Result ${result_id} already marked as persisted in Redis, skipping.`);
        }
      }
    }
  } catch (err) {
    // 检查是否是外键约束失败的错误
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      console.error(`Foreign key constraint failed for result, skipping persistence.`);
    } else {
      throw err; // 如果是其他错误，继续抛出异常
    }
  }
};



module.exports = { persistDataToMySQL };

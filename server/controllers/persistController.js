const { executeSql } = require('../utils/mysql');
const redisClient = require('../utils/redis');
const cron = require('node-cron');

const persistDataToMySQL = async () => {
  try {
    redisClient.keys('vote:*:results', async (err, keys) => {
      if (err) {
        console.error('Error fetching keys from Redis:', err);
        return;
      }

      for (const key of keys) {
        const vote_id = key.split(':')[1];

        redisClient.hgetall(key, async (err, results) => {
          if (err) {
            console.error('Error fetching results from Redis:', err);
            return;
          }

          for (const result_id in results) {
            const { user_id, vote_time, options } = JSON.parse(results[result_id]);

            const res = await executeSql(
              'INSERT INTO results (user_id, vote_id, vote_time) VALUES (?, ?, ?)',
              [user_id, vote_id, vote_time]
            );
            const new_result_id = res.insertId;

            for (const option of options) {
              await executeSql(
                'INSERT INTO result_details (result_id, option_id) VALUES (?, ?)',
                [new_result_id, option.option_id]
              );
            }

            redisClient.hdel(key, result_id);
          }
        });
      }
    });
  } catch (err) {
    console.error('Error persisting data to MySQL:', err);
  }
};

// Schedule the cron job to run every hour
cron.schedule('* * * * *', persistDataToMySQL);

module.exports = { persistDataToMySQL };

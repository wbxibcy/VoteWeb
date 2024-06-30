const cron = require('node-cron');
const { executeSql } = require('../utils/mysql');

// 定时任务，每分钟检查一次
cron.schedule('* * * * *', async () => {
    try {
        // 获取所有未开始的投票，且当前时间超过它们的开始时间
        const query = `
            SELECT vote_id 
            FROM votes 
            WHERE status = 'unstart' AND start_time <= NOW()
        `;
        const votesToStart = await executeSql(query);

        for (const vote of votesToStart) {
            // 更新投票状态为 'open'
            const updateQuery = `
                UPDATE votes 
                SET status = 'open' 
                WHERE vote_id = ?
            `;
            await executeSql(updateQuery, [vote.vote_id]);
            console.log(`Vote ${vote.vote_id} has been opened`);
        }
    } catch (err) {
        console.error('Error while opening votes:', err);
    }
});

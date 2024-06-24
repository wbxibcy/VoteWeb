const express = require('express');
const app = express();

const votingSystemDB = require('../utils/mysql');
votingSystemDB.getConnection()
const redisClient = require('../utils/redis');
redisClient.connect();

app.get('/', async(req, res) => {
    res.send("Hello World!");
})

app.get('/mysql', async (req, res) => {
    try {
        // 获取所有表名
        const [tableRows] = await votingSystemDB.query('SHOW TABLES');

        const tables = tableRows.map(row => Object.values(row)[0]);

        console.log('Tables:', tables);
        res.send('Tables: ' + JSON.stringify(tables));
    } catch (err) {
        console.error(err);
        res.status(500).send('Something went wrong');
    }
});

app.get('/redis', async (req, res) => {
    try {
        // 测试 Redis 连接
        await redisClient.set('testKey', 'testValue');
        res.send('Redis are connected!');
    } catch (err) {
        console.error(err);
        res.status(500).send('Something went wrong');
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    const url = `http://localhost:${port}`;
    console.log(`Server running on ${url}`);
});

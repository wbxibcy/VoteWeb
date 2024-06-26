const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const WebSocket = require('ws');
const cron = require('node-cron');
const { persistDataToMySQL } = require('./controllers/persistController');
// 定时任务，每分钟执行一次
cron.schedule('* * * * *', persistDataToMySQL);


const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// 允许所有来源访问
app.use(cors());
app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Headers', ['mytoken','Content-Type']);
    next();
});
app.use(bodyParser.json());

// 将 WebSocket 服务器添加到请求对象中
app.use((req, res, next) => {
    req.wss = wss;
    next();
});

// 引入路由
const userRoutes = require('./routes/users');
const voteRoutes = require('./routes/votes');
const optionRoutes = require('./routes/options');
const resultRoutes = require('./routes/results');

// Routes
app.get('/', async (req, res) => {
    res.send("Hello World!");
});

app.use('/users', userRoutes);
app.use('/votes', voteRoutes);
app.use('/vote_options', optionRoutes);
app.use('/results', resultRoutes);

// WebSocket 连接事件
wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        console.log('received: %s', message);
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// 广播功能
wss.broadcast = (data) => {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
};

// Server listening
const port = process.env.PORT || 3000;
server.listen(port, () => {
    const url = `http://localhost:${port}`;
    console.log(`Server running on ${url}`);
});

// 错误处理
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

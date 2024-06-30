const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const WebSocket = require('ws');
const passport = require('passport');
const { Strategy: JWTStrategy, ExtractJwt: ExtractJWT } = require('passport-jwt');
const jwt = require('jsonwebtoken');

require('dotenv').config();

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

// 初始化 Passport 和 JWT 策略
const jwtOptions = {
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
};

passport.use(new JWTStrategy(jwtOptions, (jwtPayload, done) => {
    // 可以在这里根据 jwtPayload 查询用户或执行其他逻辑
    return done(null, jwtPayload);
}));

app.use(passport.initialize()); // 初始化 passport 中间件

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

app.use('/users', userRoutes);
app.use('/votes', passport.authenticate('jwt', { session: false }), voteRoutes);
app.use('/vote_options', passport.authenticate('jwt', { session: false }), optionRoutes);
app.use('/results', passport.authenticate('jwt', { session: false }), resultRoutes);

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

// 启动服务器监听
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// 错误处理
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// 生成 Token 函数示例
function generateToken(user) {
    const payload = {
        id: user.id,
        username: user.username,
        // 其他用户信息
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' }); 
}

module.exports = { app, generateToken }; // 导出 app 和 generateToken 函数

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
// require('./controllers/persistController');

const app = express();
const http = require('http');
const server = http.createServer(app);
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


// Server listening
const port = process.env.PORT || 3000;
server.listen(port, () => {
    const url = `http://localhost:${port}`;
    console.log(`Server running on ${url}`);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });  
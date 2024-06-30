const { executeSql } = require('../utils/mysql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');

exports.createVoteWithOptions = async (req, res) => {
    const { user_id, vote_title, vote_description, start_time, end_time, status, min_votes, max_votes, options } = req.body;
    const vote_code = generateRandomCode();
    const authUserId = req.user.id;

    if (user_id !== authUserId) {
        return res.status(403).send('User ID does not match the authenticated user');
    }

    try {
        // 开始事务
        await executeSql('BEGIN');
        console.log('BEGIN TRANSACTION');

        // 创建投票
        const voteResults = await executeSql(
            'INSERT INTO votes (user_id, vote_title, vote_description, start_time, end_time, status, min_votes, max_votes, vote_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [user_id, vote_title, vote_description, start_time, end_time, status, min_votes, max_votes, vote_code]
        );

        const vote_id = voteResults.insertId;
        console.log('Vote created with ID:', vote_id);

        // 检查 vote_id 是否属于 user_id
        const vote = await executeSql('SELECT * FROM votes WHERE vote_id = ? AND user_id = ?', [vote_id, user_id]);
        if (vote.length === 0) {
            return res.status(403).send('You are not authorized to add options to this vote');
        }

        // 一行一行插入选项数据
        for (const option of options) {
            await executeSql('INSERT INTO vote_options (vote_id, option_title) VALUES (?, ?)', [vote_id, option.option_title]);
            console.log('Inserted option:', option.option_title);
        }

        console.log('Options inserted successfully');

        // 提交事务
        await executeSql('COMMIT');
        console.log('COMMIT TRANSACTION');

        res.status(201).send({ vote_id, vote_code, message: 'Vote and options created successfully' });
    } catch (err) {
        console.log('Transaction error:', err);

        // 如果出错，回滚事务
        await executeSql('ROLLBACK');
        console.log('ROLLBACK TRANSACTION');
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

exports.getVotesByUserId = async (req, res) => {
    const { user_id } = req.params;
    const token = req.headers.authorization; // Assuming token is passed in the Authorization header

    try {
        // Validate token and user_id
        const validToken = await validateToken(token, parseInt(user_id));

        if (!validToken) {
            return res.status(403).send('Unauthorized: Invalid token or user');
        }

        // 查询用户参与的投票，限制个数为10
        const votes = await executeSql('SELECT * FROM votes WHERE user_id = ? ORDER BY vote_id DESC LIMIT 10', [user_id]);

        // 查询每个投票的选项信息
        const votesWithOptions = await Promise.all(votes.map(async (vote) => {
            const options = await executeSql('SELECT * FROM vote_options WHERE vote_id = ?', [vote.vote_id]);
            return { ...vote, options };
        }));

        res.status(200).send(votesWithOptions);
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


exports.getVoteByCode = async (req, res) => {
    const { vote_code } = req.params;
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send('Authorization token is missing');
    }

    const token = authHeader.split(' ')[1];
    console.log(token);

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const authUserId = decoded.id;

        // Fetch vote information
        const voteResults = await executeSql('SELECT * FROM votes WHERE vote_code = ?', [vote_code]);
        if (voteResults.length === 0) {
            return res.status(404).send('Vote not found');
        }

        const vote = voteResults[0];

        // Check if the vote is closed
        if (vote.status === 'closed') {
            return res.status(403).send('投票已结束');
        }

        const options = await executeSql('SELECT * FROM vote_options WHERE vote_id = ?', [vote.vote_id]);

        res.status(200).send({ vote, options });
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).send('Invalid token');
        }
        res.status(500).send(err.message);
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
    const authUserId = req.user.id; // 从 JWT token 中获取用户 ID

    try {
        // 验证用户是否有权限删除该投票
        const voteCheck = await executeSql('SELECT * FROM votes WHERE vote_id = ? AND user_id = ?', [vote_id, authUserId]);
        if (voteCheck.length === 0) {
            return res.status(403).send('User does not have permission to delete this vote');
        }

        // 先删除与该投票相关的所有选项
        await executeSql('DELETE FROM vote_options WHERE vote_id = ?', [vote_id]);

        // 再删除投票
        await executeSql('DELETE FROM votes WHERE vote_id = ?', [vote_id]);

        res.status(200).send('Vote and its options deleted');
    } catch (err) {
        res.status(500).send(err.message);
    }
};

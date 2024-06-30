const { executeSql } = require('../utils/mysql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');

exports.createVoteWithOptions = async (req, res) => {
    const { user_id, vote_title, vote_description, start_time, end_time, min_votes, max_votes, options } = req.body;
    const vote_code = generateRandomCode();
    const authUserId = req.user.id;

    if (user_id !== authUserId) {
        return res.status(403).send('User ID does not match the authenticated user');
    }

    try {
        const currentDateTime = new Date().toISOString();
        let status = 'unstart'; // Default status

        if (currentDateTime >= start_time && currentDateTime <= end_time) {
            status = 'open';
        } else if (currentDateTime > end_time) {
            status = 'closed';
        }

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
    const { name, status } = req.query;
    const token = req.headers.authorization; // Assuming token is passed in the Authorization header

    try {
        // Validate token and user_id
        const validToken = await validateToken(token, parseInt(user_id));

        if (!validToken) {
            return res.status(403).send('Unauthorized: Invalid token or user');
        }

        // Construct the base SQL query
        let query = 'SELECT * FROM votes WHERE user_id = ?';
        const queryParams = [user_id];

        // Add conditions for name and status if provided
        if (name) {
            query += ' AND vote_title LIKE ?';
            queryParams.push(`%${name}%`);
        }
        if (status) {
            query += ' AND status = ?';
            queryParams.push(status);
        }

        query += ' ORDER BY vote_id DESC';

        // Query votes
        const votes = await executeSql(query, queryParams);

        // Query options for each vote
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
    const { user_id, vote_title, vote_description, start_time, end_time, status } = req.body;
    const token = req.headers.authorization;

    try {
        // Validate token
        const validToken = await validateToken(token, user_id);

        if (!validToken) {
            return res.status(403).send('Unauthorized: Invalid token');
        }


        // Check if the vote belongs to the authenticated user
        const voteCheck = await executeSql('SELECT * FROM votes WHERE vote_id = ? AND user_id = ?', [vote_id, user_id]);
        if (voteCheck.length === 0) {
            return res.status(403).send('User does not have permission to update this vote');
        }

        // Get current vote details
        const currentVote = voteCheck[0];

        // Determine new values
        const newValues = {
            vote_title: currentVote.vote_title,
            vote_description: currentVote.vote_description,
            start_time: currentVote.start_time,
            end_time: currentVote.end_time,
            status: currentVote.status
        };

        if (vote_title !== undefined) {
            newValues.vote_title = vote_title;
        }
        if (vote_description !== undefined) {
            newValues.vote_description = vote_description;
        }
        if (start_time !== undefined) {
            newValues.start_time = start_time;
        }
        if (end_time !== undefined) {
            newValues.end_time = end_time;
        }
        if (status !== undefined) {
            newValues.status = status;
        }

        // Validate and adjust end_time and status
        const currentDateTime = new Date().toISOString();

        if (newValues.status === 'closed') {
            newValues.end_time = currentDateTime;
        } else if (newValues.start_time && newValues.end_time) {
            if (currentDateTime >= newValues.start_time && currentDateTime <= newValues.end_time) {
                newValues.status = 'open';
            } else if (currentDateTime > newValues.end_time) {
                newValues.status = 'closed';
                newValues.end_time = currentDateTime;
            } else {
                newValues.status = 'unstart';
            }
        }

        // Construct the SQL query dynamically based on provided fields
        const fieldsToUpdate = [];
        const valuesToUpdate = [];

        if (newValues.vote_title !== currentVote.vote_title) {
            fieldsToUpdate.push('vote_title = ?');
            valuesToUpdate.push(newValues.vote_title);
        }
        if (newValues.vote_description !== currentVote.vote_description) {
            fieldsToUpdate.push('vote_description = ?');
            valuesToUpdate.push(newValues.vote_description);
        }
        if (newValues.start_time !== currentVote.start_time) {
            fieldsToUpdate.push('start_time = ?');
            valuesToUpdate.push(newValues.start_time);
        }
        if (newValues.end_time !== currentVote.end_time) {
            fieldsToUpdate.push('end_time = ?');
            valuesToUpdate.push(newValues.end_time);
        }
        if (newValues.status !== currentVote.status) {
            fieldsToUpdate.push('status = ?');
            valuesToUpdate.push(newValues.status);
        }

        if (fieldsToUpdate.length > 0) {
            valuesToUpdate.push(vote_id);

            const updateQuery = `UPDATE votes SET ${fieldsToUpdate.join(', ')} WHERE vote_id = ?`;
            console.log(updateQuery);
            await executeSql(updateQuery, valuesToUpdate);

            res.status(200).send('Vote updated');
        } else {
            res.status(400).send('No valid fields provided to update');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
};


exports.deleteVote = async (req, res) => {
    const { vote_id } = req.params;
    const authHeader = req.headers.authorization;

    try {
        // Validate token
        const token = authHeader.split(' ')[1];
        const validToken = jwt.verify(token, process.env.JWT_SECRET);

        if (!validToken) {
            return res.status(403).send('Unauthorized: Invalid token');
        }

        const authUserId = validToken.id;

        // Check if the vote belongs to the authenticated user
        const voteCheck = await executeSql('SELECT * FROM votes WHERE vote_id = ? AND user_id = ?', [vote_id, authUserId]);
        if (voteCheck.length === 0) {
            return res.status(403).send('User does not have permission to delete this vote');
        }

        // Delete vote options first
        await executeSql('DELETE FROM vote_options WHERE vote_id = ?', [vote_id]);

        // Delete the vote
        await executeSql('DELETE FROM votes WHERE vote_id = ?', [vote_id]);

        res.status(200).send('Vote and its options deleted');
    } catch (err) {
        res.status(500).send(err.message);
    }
};


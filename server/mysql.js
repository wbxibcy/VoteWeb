const mysql = require('mysql2/promise');
const fs = require('fs');

const pool = mysql.createPool({
  host: '127.0.0.1', 
  user: 'root',
  password: 'myvoteweb',
  database: 'voting_system',
  multipleStatements: true // 允许执行多条SQL语句
});

const initDb = async () => {
  try {
    // 读取SQL文件
    const sql = fs.readFileSync('init.sql', 'utf8');
    
    // 从连接池获取连接
    const connection = await pool.getConnection();
    
    // 执行SQL脚本
    await connection.query(sql);
    console.log('Database initialized');

  } catch (err) {
    console.error('Error initializing database:', err);
  }
};

// 初始化数据库
initDb();

const executeSql = async (sql, params) => {
  try {
    const conn = await pool.getConnection();
    console.log(sql, params);
    const [results, fields] = await conn.query(sql, params);
    conn.release();
    console.log("----------")
    console.log(results)
    return results;
  } catch (error) {
    throw error;
  }
};


module.exports = {
  pool, executeSql
}
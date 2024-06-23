-- 创建数据库
CREATE DATABASE IF NOT EXISTS voting_system;
USE voting_system;

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- 创建投票主表
CREATE TABLE IF NOT EXISTS votes (
    vote_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    vote_title VARCHAR(255) NOT NULL,
    vote_description TEXT,
    start_time DATETIME,
    end_time DATETIME,
    status VARCHAR(50),
    min_votes INT,
    max_votes INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 创建投票明细表
CREATE TABLE IF NOT EXISTS vote_options (
    option_id INT AUTO_INCREMENT PRIMARY KEY,
    vote_id INT NOT NULL,
    option_title VARCHAR(255) NOT NULL,
    FOREIGN KEY (vote_id) REFERENCES votes(vote_id)
);

-- 创建结果主表
CREATE TABLE IF NOT EXISTS results (
    result_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    vote_id INT NOT NULL,
    vote_time DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (vote_id) REFERENCES votes(vote_id)
);

-- 创建结果明细表
CREATE TABLE IF NOT EXISTS result_details (
    detail_id INT AUTO_INCREMENT PRIMARY KEY,
    result_id INT NOT NULL,
    option_id INT NOT NULL,
    FOREIGN KEY (result_id) REFERENCES results(result_id),
    FOREIGN KEY (option_id) REFERENCES vote_options(option_id)
);

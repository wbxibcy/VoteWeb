# VoteWeb

## 项目介绍

主要目的是为用户或组织提供一个便捷、高效的平台，用于进行各种形式的投票和民意调查。

简单讲：一个朴实无华的投票系统

## 功能介绍

- 登录注册（token）
- 创建投票
- 投票码查询投票
- 实时显示结果
- 编辑投票
- 投票结果可视化
- 投票历史记录筛选
- 删除投票
- 用户参与投票

## 安装指南

### 后端

```shell
cd ./server
npm install
mkdir .env
vim .env
# 这里填入 JWT_SECRET
JWT_SECRET=your_secret_key
npm start
```

### 前端

```shell
cd ./lesson
npm install
npm run dev
```

## 技术栈

**前端**: 使用 **Vue** 和 **Vite** 构建现代化的用户界面，集成 **Element Plus** 提供丰富的UI组件和界面设计。

**数据可视化**: 利用 **Echarts** 实现数据可视化和交互式图表展示，为用户提供直观的数据分析工具。

**后端**: 基于 **Node.js** 构建稳健的后端服务，利用 **JWT** 进行安全的用户身份验证和授权管理。

**实时通信**: 通过 **WebSocket** 实现高效的实时通信功能，支持实时投票结果和用户互动。

**数据存储**: 使用 **MySQL** 作为关系型数据库管理系统，结合 **Redis** 提供快速和可扩展的缓存服务，优化数据读写性能。

**容器化部署**: 使用 **Docker** 容器技术实现应用的快速部署和环境隔离，简化开发、测试和生产环境的管理和配置。

## api设计

#### 注册用户 (Register User)

- **URL:** `/users/register`

- **Method:** `POST`

- Request Body:

  ```json
  {
    "username": "xx",
    "password": "123456"
  }
  ```

- Response:

  - `201 Created`：注册成功，返回用户 ID 和用户名。
  - `500 Internal Server Error`：服务器错误。

#### 用户登录 (User Login)

- **URL:** `/users/login`

- **Method:** `POST`

- **Header：**`token`

- Request Body:

  ```json
  {
    "username": "exampleuser",
    "password": "examplepassword"
  }
  ```

- Response:

  - `200 OK`：登录成功，返回用户 ID 和用户名和token。
  - `401 Unauthorized`：用户名或密码错误。
  - `500 Internal Server Error`：服务器错误。

#### 创建投票 (Create Vote)

- **URL:** `/votes`

- **Method:** `POST`

- **Header：**`token`

- Request Body:

  ```json
  {
    "user_id": 1,
    "vote_title": "Favorite Programming Language",
    "vote_description": "Vote for your favorite programming language",
    "start_time": "2024-06-21T00:00:00",
    "end_time": "2024-06-30T23:59:59",
    "min_votes": 1,
    "max_votes": 1,
    "options": [
        { "option_title": "Java" },
      {"option_title":"Python"},
      {"option_title":"Go"}
    ]
  }
  ```

- Response:

  - `201 Created`：投票创建成功，返回投票 ID和投票码和添加成功的message。
  - `500 Internal Server Error`：服务器错误。

#### 根据用户ID获取投票信息 (Get Vote by user_ID) 

- **URL:** `/votes/user/:user_id` 

  - 注意：可以动态构建url
    例如：`/votes/user/31?name=手游选择&status=closed`
    	    `/votes/user/31?name=手游选择`

    ​	    `/votes/user/31?status=open`

- **Method:** `GET` 

- **Header：**`token`

- Response: 

- - `200 OK`: 返回用户id的投票信息。   
  - `404 Not Found`: 没有找到对应投票码的投票信息。  
  - `500 Internal Server Error`: 服务器错误。

#### 根据投票码获取投票信息 (Get Vote by vote_code) 

- **URL:** `/votes/code/:vote_code` 
- **Method:** `GET` 
- **Header：**`token`
- Response: 
- - `200 OK`: 返回对应投票码的投票信息。   
  - `404 Not Found`: 没有找到对应投票码的投票信息。  
  - `500 Internal Server Error`: 服务器错误。

#### 更新投票 (Update Vote)

- **URL:** `/votes/:vote_id`

- **Method:** `PUT`

- **Header：**`token`

- Request Body:

  ```json
  {
    "user_id": 31,
    "vote_title": "Updated Title1",
    "start_time": "2024-06-21T00:00:00",
    "end_time": "2024-06-30T23:59:59",
    "status": "open"
  }
  ```
  
- Response:

  - `200 OK`：投票更新成功。
  - `500 Internal Server Error`：服务器错误。

#### 删除投票 (Delete Vote)

- **URL:** `/votes/:vote_id`
- **Header：**`token`
- **Method:** `DELETE`
- Response:
  - `200 OK`：投票删除成功。
  - `500 Internal Server Error`：服务器错误。

#### 提交投票结果 (Submit Vote)

- **URL:** `/results`

- **Method:** `POST`

- **Header：**`token`

- Request Body:

  ```json
  {
    "vote_id": 2,
    "user_id": 19,
    "options": [
      {"option_id": "1"},
      {"option_id": "2"}
    ]
  }
  ```

- Response:

  - `201 Created`：投票结果提交成功。
  - `500 Internal Server Error`：服务器错误。

#### 获取投票的结果 (Get Results by Vote ID)

- **URL:** `/results/:user_id/:vote_id`
- **Method:** `GET`
- **Header：**`token`
- Response:
  - `200 OK`：返回投票的结果。
  - `500 Internal Server Error`：服务器错误。

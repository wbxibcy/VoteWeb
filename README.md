# VoteWeb

## 项目介绍

## api设计

### 用户 (Users)

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

- Request Body:

  ```json
  {
    "username": "exampleuser",
    "password": "examplepassword"
  }
  ```

- Response:

  - `200 OK`：登录成功，返回用户 ID 和用户名。
  - `401 Unauthorized`：用户名或密码错误。
  - `500 Internal Server Error`：服务器错误。

### 投票 (Votes)

#### 创建投票 (Create Vote)

- **URL:** `/votes`

- **Method:** `POST`

- Request Body:

  ```json
  {
    "user_id": 1,
    "vote_title": "Favorite Programming Language",
    "vote_description": "Vote for your favorite programming language",
    "start_time": "2024-06-21T00:00:00",
    "end_time": "2024-06-30T23:59:59",
    "status": "open",
    "min_votes": 1,
    "max_votes": 10
  }
  ```

- Response:

  - `201 Created`：投票创建成功，返回投票 ID和投票码。
  - `500 Internal Server Error`：服务器错误。

#### 根据用户ID获取投票信息 (Get Vote by user_ID) 

- **URL:** `/votes/user/:user_id` 
- **Method:** `GET` 
- Response: 
- - `200 OK`: 返回用户id的投票信息。   
  - `404 Not Found`: 没有找到对应投票码的投票信息。  
  - `500 Internal Server Error`: 服务器错误。

#### 根据投票码获取投票信息 (Get Vote by vote_code) 

- **URL:** `/votes/code/:vote_code` 
- **Method:** `GET` 
- Response: 
- - `200 OK`: 返回对应投票码的投票信息。   
  - `404 Not Found`: 没有找到对应投票码的投票信息。  
  - `500 Internal Server Error`: 服务器错误。

#### 获取特定投票 (Get Vote by ID)

- **URL:** `/votes/id/:vote_id`
- **Method:** `GET`
- Response:
  - `200 OK`：返回特定投票的详细信息。
  - `404 Not Found`：投票不存在。
  - `500 Internal Server Error`：服务器错误。

#### 更新投票 (Update Vote)

- **URL:** `/votes/:vote_id`

- **Method:** `PUT`

- Request Body:

  ```json
  {
    "vote_title": "Updated Title",
    "vote_description": "Updated Description",
    "start_time": "2024-06-21T00:00:00",
    "end_time": "2024-06-30T23:59:59",
    "status": "closed",
    "min_votes": 1,
    "max_votes": 10
  }
  ```

- Response:

  - `200 OK`：投票更新成功。
  - `500 Internal Server Error`：服务器错误。

#### 删除投票 (Delete Vote)

- **URL:** `/votes/:vote_id`
- **Method:** `DELETE`
- Response:
  - `200 OK`：投票删除成功。
  - `500 Internal Server Error`：服务器错误。

### 投票选项 (Vote Options)

#### 添加投票选项 (Add Option to Vote)

- **URL:** `/vote_options`

- **Method:** `POST`

- Request Body:

  ```json
  {
    "user_id": 1,
    "vote_id": 1,
    "options": [
      { "option_title": "JavaScript" },
      { "option_title": "Python" },
      { "option_title": "Java" }
    ]
  }
  ```

- Response:

  - `201 Created`：选项添加成功，返回选项 ID。
  - `500 Internal Server Error`：服务器错误。

#### 获取特定投票的选项 (Get Options by Vote ID)

- **URL:** `/vote_options/:user_id/:vote_id/options`
- **Method:** `GET`
- Response:
  - `200 OK`：返回特定投票的所有选项。
  - `500 Internal Server Error`：服务器错误。

#### 删除投票选项 (Delete Option)

- **URL:** `/vote_options/:user_id/:vote_id/options/:option_id`
- **Method:** `DELETE`
- Response:
  - `200 OK`：选项删除成功。
  - `500 Internal Server Error`：服务器错误。

### 投票结果 (Results)

#### 提交投票结果 (Submit Vote)

- **URL:** `/results`

- **Method:** `POST`

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

#### 获取特定投票的结果 (Get Results by Vote ID)

- **URL:** `/results/:vote_id`
- **Method:** `GET`
- Response:
  - `200 OK`：返回特定投票的结果。
  - `500 Internal Server Error`：服务器错误。

#### 导出投票结果（Get Results by Vote ID）

- **URL:** `/export/:vote_id`
- **Method:** `GET`
- Response:
  - `200 OK`：返回投票的结果。
  - `500 Internal Server Error`：服务器错误。
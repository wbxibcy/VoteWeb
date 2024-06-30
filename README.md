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

### 投票 (Votes)

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

- Request Body:

  ```json
  {
    "vote_title": "Updated Title",
    "start_time": "2024-06-21T00:00:00",
    "end_time": "2024-06-30T23:59:59",
    "status": "closed"
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

### 投票结果 (Results)

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

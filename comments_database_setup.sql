1. CREATE DATABASE comments_test;
2. USE comments_test;
3. CREATE TABLE comments (
    commentId int PRIMARY KEY AUTO_INCREMENT,
    archive varchar(255),
    filepath varchar(255),

    parentCommentId int,
    statement text,

    isEdited tinyint,
    isPrivate tinyint,
    isDeleted tinyint,

    hiddenStatus enum('UNHIDDEN', 'SPAM', 'INCORRECT', 'IRRELEVANT', 'ABUSE','OTHER'),
    hiddenJustification varchar(255),

    selectedText text,
    selectedElement text,

    isAnonymous tinyint,
    userId varchar(255),
    userName varchar(255),
    userEmail varchar(255),

    postedTimestamp timestamp DEFAULT CURRENT_TIMESTAMP,
    updatedTimestamp timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
4. CREATE TABLE updateHistory (
    updateId int PRIMARY KEY AUTO_INCREMENT,
    ownerId varchar(255),
    updaterId varchar(255) NOT NULL,
    commentId int NOT NULL,
    previousStatement text,
    previousHiddenStatus enum('UNHIDDEN', 'SPAM', 'INCORRECT', 'IRRELEVANT', 'ABUSE','OTHER'),
    previousHiddenJustification varchar(255),

    updatedTimestamp timestamp DEFAULT CURRENT_TIMESTAMP
);
5. You may have to run the following command. See https://stackoverflow.com/questions/50093144/mysql-8-0-client-does-not-support-authentication-protocol-requested-by-server

```
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
```

local installation
- Development Computer
- TCP/IP port: 3306 XProtocolPort: 33060
- root password: abctest
- Configure MySQL as a windows service, windows service name: MySQL80, Standard System Account

1. create database comments_staging;
2. use comments_staging;
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

    userId varchar(255),
    userName varchar(255),
    userEmail varchar(255),

    postedTimestamp timestamp DEFAULT CURRENT_TIMESTAMP,
    updatedTimestamp timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
4. CREATE TABLE updateHistory (
    updateId int PRIMARY KEY AUTO_INCREMENT,
    updaterId int NOT NULL,
    commentId int NOT NULL,
    previousStatement text,
    previousHiddenStatus enum('UNHIDDEN', 'SPAM', 'INCORRECT', 'IRRELEVANT', 'ABUSE','OTHER'),
    previousHiddenJustification varchar(255),

    updatedTimestamp timestamp DEFAULT CURRENT_TIMESTAMP
)

local installation
- Development Computer
- TCP/IP port: 3306 XProtocolPort: 33060
- root password: abctest
- Configure MySQL as a windows service, windows service name: MySQL80, Standard System Account

create database comments_test;
use comments_test;

ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'abctest';

#use comments_staging;
CREATE TABLE comments (
    commentId int PRIMARY KEY AUTO_INCREMENT,
    archive varchar(255),
    filepath varchar(255),

    parentCommentId int,
    threadId int,
    statement text,
    commentType ENUM('QUESTION', 'REMARK', 'OTHER'),
    questionStatus ENUM('UNANSWERED', 'ANSWERED', 'ACCEPTED', 'OTHER'),
    courseId varchar(255),
    courseTerm varchar(255),
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

CREATE TABLE updateHistory (
   updateId int PRIMARY KEY AUTO_INCREMENT,
    ownerId varchar(255),
    updaterId varchar(255),
    commentId int NOT NULL,
    previousStatement text,
    previousHiddenStatus enum('UNHIDDEN', 'SPAM', 'INCORRECT', 'IRRELEVANT', 'ABUSE','OTHER'),
    previousHiddenJustification varchar(255),
    previousQuestionStatus ENUM('UNANSWERED', 'ANSWERED', 'ACCEPTED', 'OTHER'),
    
    updatedTimestamp timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE points (
    points int,
    reason varchar(255),
    
    userId varchar(255),
	commentId int unique,
    granterId varchar(255),
    
	grantTimestamp timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
    userId VARCHAR(255),
    updateId INT PRIMARY KEY AUTO_INCREMENT,
    header VARCHAR(255),
    content VARCHAR(255),
    header_de VARCHAR(255),
    content_de VARCHAR(255),
    link VARCHAR(255),
    notificationType VARCHAR(255),
    postedTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE userInfo (
    userId VARCHAR(50) PRIMARY KEY,
    firstName VARCHAR(255),
    lastName VARCHAR(255),
    email VARCHAR(255),
    notificationSeenTs VARCHAR(255)
);
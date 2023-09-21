create database grading;
use grading;

DROP TABLE grading;

CREATE TABLE grading (
    gradingId int PRIMARY KEY AUTO_INCREMENT,
    userId varchar(255) NOT NULL,
    quizId varchar(255) NOT NULL,
    problemId varchar(255) NOT NULL,
    
    singleOptionIdx int,
    multipleOptionIdxs varchar(255), # comma delimited list of numbers
    filledInAnswer text,
    
    isCorrect boolean,
    
    browserTimestamp_ms bigint,
    postedTimestamp timestamp DEFAULT CURRENT_TIMESTAMP
);
SELECT * FROM grading;

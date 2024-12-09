use comments_staging;

#ALTER TABLE comments DROP column questionStatus;
ALTER TABLE comments ADD threadId INT;
ALTER TABLE comments ADD commentType ENUM('QUESTION', 'REMARK', 'OTHER');
ALTER TABLE comments ADD questionStatus ENUM('UNANSWERED', 'ANSWERED', 'ACCEPTED', 'OTHER');
ALTER TABLE comments ADD courseId varchar(255);
ALTER TABLE comments ADD courseTerm varchar(255);
ALTER TABLE updateHistory ADD previousQuestionStatus ENUM('UNANSWERED', 'ANSWERED', 'ACCEPTED', 'OTHER');

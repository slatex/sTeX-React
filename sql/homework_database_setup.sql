create database homework_data;
use homework_data;

CREATE TABLE homework (
    homeworkId INT PRIMARY KEY AUTO_INCREMENT,    
    homeworkName VARCHAR(255) ,          
    homeworkDate DATE ,                  
    courseId VARCHAR(255)  ,                
    courseInstance VARCHAR(255)  ,                   
    archive VARCHAR(255),                          
    filepath VARCHAR(255),                         
);

SELECT * FROM homework;

import express from 'express';
import { getQuizzes, quizIntro, quizQuestions, quizResults } from '../controllers/students/studentQuiz.js';
import { studentsLogin } from '../controllers/students/studentsAuth.js';
import {studentsOverview, updateStudentProfile} from '../controllers/students/studentsOverview.js';
import { coursesOverview, getAvailableCourses, viewCourse } from '../controllers/students/studentsCourses.js';
import { requireAuth } from '../middleware/authMiddleware.js';


const studentsRouter = express.Router();


studentsRouter.post('/login', studentsLogin);

// Apply authentication middleware for subsequent routes
studentsRouter.use(requireAuth);

studentsRouter.get('/overview', studentsOverview);
studentsRouter.get('/courseOVerview', coursesOverview);
studentsRouter.get('/availablecourses', getAvailableCourses);
studentsRouter.get('/viewcourse/:id', viewCourse);


// quiz
studentsRouter.get('/quizzes', getQuizzes);
studentsRouter.get('/quiz/:id', quizIntro);
studentsRouter.get('/quiz-questions/:id', quizQuestions);
studentsRouter.post('/quiz-results/:id', quizResults);


// students setting
studentsRouter.put('/profile', updateStudentProfile);




export default studentsRouter
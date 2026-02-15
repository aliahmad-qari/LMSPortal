const Quiz = require('../models/Quiz');
const QuizQuestion = require('../models/QuizQuestion');
const QuizAttempt = require('../models/QuizAttempt');
const Course = require('../models/Course');

// @desc    Create new quiz
// @route   POST /api/quizzes
// @access  Instructor
exports.createQuiz = async (req, res) => {
    try {
        const { title, description, courseId, timeLimit } = req.body;

        if (!title || !courseId) {
            return res.status(400).json({ message: 'Title and courseId are required' });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const quiz = await Quiz.create({
            title,
            description,
            course: courseId,
            createdBy: req.user._id,
            timeLimit: timeLimit || 30
        });

        res.status(201).json(quiz);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get quizzes for a course (Instructor & Student)
// @route   GET /api/quizzes/course/:courseId
// @access  Private
exports.getQuizzesByCourse = async (req, res) => {
    try {
        const quizzes = await Quiz.find({ course: req.params.courseId })
            .populate('questions')
            .sort({ createdAt: -1 });
        res.json(quizzes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get single quiz (with questions)
// @route   GET /api/quizzes/:id
// @access  Private
exports.getQuizById = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id).populate('questions');
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        res.json(quiz);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Add question to quiz
// @route   POST /api/quizzes/:id/questions
// @access  Instructor
exports.addQuestion = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        if (quiz.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { question, options, correctAnswer, marks } = req.body;

        if (!question || !options || options.length < 2 || correctAnswer === undefined) {
            return res.status(400).json({ message: 'Invalid question data' });
        }

        const newQuestion = await QuizQuestion.create({
            quizId: quiz._id,
            question,
            options,
            correctAnswer,
            marks: marks || 1
        });

        quiz.questions.push(newQuestion._id);
        await quiz.save();

        res.status(201).json(newQuestion);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
// @access  Instructor
exports.deleteQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        if (quiz.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Delete dependencies
        await QuizQuestion.deleteMany({ quizId: quiz._id });
        await QuizAttempt.deleteMany({ quizId: quiz._id });
        await quiz.deleteOne();

        res.json({ message: 'Quiz removed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Submit quiz attempt
// @route   POST /api/quizzes/:id/submit
// @access  Student
exports.submitQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id).populate('questions');
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Check if already attempted
        const existing = await QuizAttempt.findOne({ quizId: quiz._id, studentId: req.user._id });
        if (existing) {
            return res.status(400).json({ message: 'You have already attempted this quiz' });
        }

        const { responses } = req.body;

        if (!responses || !Array.isArray(responses)) {
            return res.status(400).json({ message: 'Invalid responses format' });
        }

        let score = 0;
        const processedResponses = [];

        responses.forEach(response => {
            // Find question safely
            const question = quiz.questions.find(q => q && q._id.toString() === response.questionId);

            if (question) {
                // Ensure we compare valid numbers or strings
                const selectedOptIndex = parseInt(response.selectedOption);
                const correctOptIndex = parseInt(question.correctAnswer);

                if (!isNaN(selectedOptIndex) && !isNaN(correctOptIndex) && selectedOptIndex === correctOptIndex) {
                    score += (question.marks || 1);
                }

                processedResponses.push({
                    questionId: question._id,
                    selectedOption: response.selectedOption
                });
            }
        });

        const attempt = await QuizAttempt.create({
            quizId: quiz._id,
            studentId: req.user._id,
            score,
            responses: processedResponses
        });

        res.status(201).json({ score, attempt });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get student attempts for a quiz (Instructor)
// @route   GET /api/quizzes/:id/attempts
// @access  Instructor
exports.getQuizAttempts = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (quiz.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const attempts = await QuizAttempt.find({ quizId: req.params.id })
            .populate('studentId', 'name email')
            .sort({ submittedAt: -1 });

        res.json(attempts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get my attempts (Student)
// @route   GET /api/quizzes/:id/my-attempts
// @access  Student
exports.getMyAttempts = async (req, res) => {
    try {
        const attempts = await QuizAttempt.find({
            quizId: req.params.id,
            studentId: req.user._id
        });
        res.json(attempts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

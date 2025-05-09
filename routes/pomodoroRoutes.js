const express = require('express');
const { body } = require('express-validator');
const pomodoroController = require('../controllers/pomodoroController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Get all pomodoro sessions
router.get('/', pomodoroController.getAllPomodoros);

// Get single pomodoro session
router.get('/:id', pomodoroController.getPomodoro);

// Create pomodoro session
router.post(
  '/',
  [
    body('title').notEmpty().withMessage('Judul harus diisi'),
    body('focus_time').isInt({ min: 1 }).withMessage('Focus time harus berupa angka positif'),
    body('short_break_time').isInt({ min: 1 }).withMessage('Short break time harus berupa angka positif'),
    body('long_break_time').isInt({ min: 1 }).withMessage('Long break time harus berupa angka positif'),
    body('loops').isInt({ min: 1 }).withMessage('Jumlah loops harus berupa angka positif'),
    body('loops_before_long_break').isInt({ min: 1 }).withMessage('Loops before long break harus berupa angka positif')
  ],
  pomodoroController.createPomodoro
);

// Update pomodoro session
router.put(
  '/:id',
  [
    body('title').notEmpty().withMessage('Judul harus diisi'),
    body('focus_time').isInt({ min: 1 }).withMessage('Focus time harus berupa angka positif'),
    body('short_break_time').isInt({ min: 1 }).withMessage('Short break time harus berupa angka positif'),
    body('long_break_time').isInt({ min: 1 }).withMessage('Long break time harus berupa angka positif'),
    body('loops').isInt({ min: 1 }).withMessage('Jumlah loops harus berupa angka positif'),
    body('loops_before_long_break').isInt({ min: 1 }).withMessage('Loops before long break harus berupa angka positif')
  ],
  pomodoroController.updatePomodoro
);

// Delete pomodoro session
router.delete('/:id', pomodoroController.deletePomodoro);

module.exports = router;
const { validationResult } = require('express-validator');
const Pomodoro = require('../models/Pomodoro');

// Get all pomodoro sessions
exports.getAllPomodoros = async (req, res) => {
  try {
    const pomodoros = await Pomodoro.findAll(req.user.id);
    
    res.status(200).json({
      success: true,
      count: pomodoros.length,
      data: pomodoros
    });
  } catch (error) {
    console.error('Get all pomodoros error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data pomodoro'
    });
  }
};

// Get single pomodoro session
exports.getPomodoro = async (req, res) => {
  try {
    const pomodoro = await Pomodoro.findById(req.params.id, req.user.id);
    
    if (!pomodoro) {
      return res.status(404).json({
        success: false,
        message: 'Pomodoro session tidak ditemukan'
      });
    }
    
    res.status(200).json({
      success: true,
      data: pomodoro
    });
  } catch (error) {
    console.error('Get pomodoro error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data pomodoro'
    });
  }
};

// Create pomodoro session
exports.createPomodoro = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const pomodoroData = {
      user_id: req.user.id,
      title: req.body.title,
      description: req.body.description || '',
      focus_time: req.body.focus_time,
      short_break_time: req.body.short_break_time,
      long_break_time: req.body.long_break_time,
      loops: req.body.loops,
      loops_before_long_break: req.body.loops_before_long_break
    };
    
    const pomodoroId = await Pomodoro.create(pomodoroData);
    
    res.status(201).json({
      success: true,
      message: 'Pomodoro session berhasil dibuat',
      data: {
        id: pomodoroId,
        ...pomodoroData
      }
    });
  } catch (error) {
    console.error('Create pomodoro error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat membuat pomodoro session'
    });
  }
};

// Update pomodoro session
exports.updatePomodoro = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    // Cek apakah pomodoro ada
    const pomodoro = await Pomodoro.findById(req.params.id, req.user.id);
    
    if (!pomodoro) {
      return res.status(404).json({
        success: false,
        message: 'Pomodoro session tidak ditemukan'
      });
    }
    
    const pomodoroData = {
      title: req.body.title,
      description: req.body.description || '',
      focus_time: req.body.focus_time,
      short_break_time: req.body.short_break_time,
      long_break_time: req.body.long_break_time,
      loops: req.body.loops,
      loops_before_long_break: req.body.loops_before_long_break
    };
    
    const updated = await Pomodoro.update(req.params.id, req.user.id, pomodoroData);
    
    if (!updated) {
      return res.status(400).json({
        success: false,
        message: 'Gagal memperbarui pomodoro session'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Pomodoro session berhasil diperbarui',
      data: {
        id: req.params.id,
        ...pomodoroData
      }
    });
  } catch (error) {
    console.error('Update pomodoro error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memperbarui pomodoro session'
    });
  }
};

// Delete pomodoro session
exports.deletePomodoro = async (req, res) => {
  try {
    // Cek apakah pomodoro ada
    const pomodoro = await Pomodoro.findById(req.params.id, req.user.id);
    
    if (!pomodoro) {
      return res.status(404).json({
        success: false,
        message: 'Pomodoro session tidak ditemukan'
      });
    }
    
    const deleted = await Pomodoro.delete(req.params.id, req.user.id);
    
    if (!deleted) {
      return res.status(400).json({
        success: false,
        message: 'Gagal menghapus pomodoro session'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Pomodoro session berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete pomodoro error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menghapus pomodoro session'
    });
  }
};
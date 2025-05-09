const db = require('../config/db');

class Pomodoro {
  static async findAll(userId) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM pomodoro_sessions WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id, userId) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM pomodoro_sessions WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async create(pomodoroData) {
    const {
      user_id,
      title,
      description,
      focus_time,
      short_break_time,
      long_break_time,
      loops,
      loops_before_long_break
    } = pomodoroData;
    
    try {
      const [result] = await db.execute(
        `INSERT INTO pomodoro_sessions 
        (user_id, title, description, focus_time, short_break_time, long_break_time, loops, loops_before_long_break) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [user_id, title, description, focus_time, short_break_time, long_break_time, loops, loops_before_long_break]
      );
      
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, userId, pomodoroData) {
    const {
      title,
      description,
      focus_time,
      short_break_time,
      long_break_time,
      loops,
      loops_before_long_break
    } = pomodoroData;
    
    try {
      const [result] = await db.execute(
        `UPDATE pomodoro_sessions 
        SET title = ?, description = ?, focus_time = ?, short_break_time = ?, 
        long_break_time = ?, loops = ?, loops_before_long_break = ? 
        WHERE id = ? AND user_id = ?`,
        [title, description, focus_time, short_break_time, long_break_time, loops, loops_before_long_break, id, userId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id, userId) {
    try {
      const [result] = await db.execute(
        'DELETE FROM pomodoro_sessions WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Pomodoro;
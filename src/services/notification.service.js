const db = require("../config/db");

const executeQuery = async (sql, params = []) => {
    const [results] = await db.query(sql, params);
    return results;
};

class NotificationService {
    async create(userId, type, title, message, referenceType = null, referenceId = null) {
        const sql = `INSERT INTO notifications (user_id, type, title, message, reference_type, reference_id)
                     VALUES (?,?,?,?,?,?)`;
        return await executeQuery(sql, [userId, type, title, message, referenceType, referenceId]);
    }

    async getForUser(userId, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const notifications = await executeQuery(
            "SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT ? OFFSET ?",
            [userId, limit, offset]
        );
        const unreadCount = await executeQuery(
            "SELECT COUNT(*) as count FROM notifications WHERE user_id=? AND is_read=0",
            [userId]
        );
        return { notifications, unreadCount: unreadCount[0].count };
    }

    async markAsRead(id, userId) {
        return await executeQuery(
            "UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?",
            [id, userId]
        );
    }

    async markAllAsRead(userId) {
        return await executeQuery(
            "UPDATE notifications SET is_read=1 WHERE user_id=? AND is_read=0",
            [userId]
        );
    }

    async getUnreadCount(userId) {
        const result = await executeQuery(
            "SELECT COUNT(*) as count FROM notifications WHERE user_id=? AND is_read=0",
            [userId]
        );
        return result[0].count;
    }
}

module.exports = new NotificationService();

const db = require("../config/db");

const executeQuery = async (sql, params = []) => {
    const [results] = await db.query(sql, params);
    return results;
};

class ActivityService {
    async logActivity(userId, action, targetType = null, targetId = null, details = null, ipAddress = null) {
        const sql = `INSERT INTO activity_logs (user_id, action, target_type, target_id, details, ip_address)
                     VALUES (?,?,?,?,?,?)`;
        return await executeQuery(sql, [userId, action, targetType, targetId, details, ipAddress]);
    }

    async getActivitiesByUser(userId, limit = 50) {
        return await executeQuery(
            "SELECT * FROM activity_logs WHERE user_id=? ORDER BY created_at DESC LIMIT ?",
            [userId, limit]
        );
    }

    async getRecentActivities(limit = 100) {
        return await executeQuery(
            `SELECT al.*, u.full_name, u.email, r.role_name
             FROM activity_logs al
             LEFT JOIN users u ON al.user_id = u.id
             LEFT JOIN roles r ON u.role_id = r.id
             ORDER BY al.created_at DESC
             LIMIT ?`,
            [limit]
        );
    }
}

module.exports = new ActivityService();

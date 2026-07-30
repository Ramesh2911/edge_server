const db = require("../config/db");

/**
 * Fetch users based on role_id along with their property count
 */
const getUsersByRoleId = async (roleId) => {
    const query = `
        SELECT 
            u.id,
            u.full_name,
            u.email,
            u.mobile AS phone,
            COUNT(p.id) AS total_properties
        FROM users u
        LEFT JOIN properties p ON u.id = p.user_id
        WHERE u.role_id = ?
        GROUP BY u.id, u.full_name, u.email, u.mobile
    `;

    // Use the promise-based pool exported from config/db.js
    try {
        const [rows] = await db.query(query, [roleId]);
        return rows;
    } catch (err) {
        throw err;
    }
};

module.exports = {
    getUsersByRoleId
};
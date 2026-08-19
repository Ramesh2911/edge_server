const db = require("../config/db");

const executeQuery = async (sql, params = []) => {
    const [results] = await db.query(sql, params);
    return results;
};

class DashboardService {
    async getSuperAdminStats() {
        const totalUsers = await executeQuery("SELECT COUNT(*) as count FROM users");
        const totalProperties = await executeQuery("SELECT COUNT(*) as count FROM properties");
        const approvedProperties = await executeQuery("SELECT COUNT(*) as count FROM properties WHERE property_status='Approved'");
        const pendingProperties = await executeQuery("SELECT COUNT(*) as count FROM properties WHERE property_status='Pending'");
        const rejectedProperties = await executeQuery("SELECT COUNT(*) as count FROM properties WHERE property_status='Rejected'");
        const totalBuyers = await executeQuery("SELECT COUNT(*) as count FROM users WHERE role_id=7");
        const totalOwners = await executeQuery("SELECT COUNT(*) as count FROM users WHERE role_id=4");
        const totalBrokers = await executeQuery("SELECT COUNT(*) as count FROM users WHERE role_id=5");
        const totalDevelopers = await executeQuery("SELECT COUNT(*) as count FROM users WHERE role_id=6");
        const totalLeads = await executeQuery("SELECT COUNT(*) as count FROM buyer_requirements");
        const totalInquiries = await executeQuery("SELECT COUNT(*) as count FROM property_inquiries");
        const recentProperties = await executeQuery("SELECT p.id, p.property_title, p.city, p.price, p.property_status, p.created_at, pv.admin_a_status, pv.admin_b_status, pv.super_admin_status FROM properties p LEFT JOIN property_verification pv ON p.id = pv.property_id ORDER BY p.created_at DESC LIMIT 10");

        return {
            totalUsers: totalUsers[0].count,
            totalProperties: totalProperties[0].count,
            approvedProperties: approvedProperties[0].count,
            pendingProperties: pendingProperties[0].count,
            rejectedProperties: rejectedProperties[0].count,
            totalBuyers: totalBuyers[0].count,
            totalOwners: totalOwners[0].count,
            totalBrokers: totalBrokers[0].count,
            totalDevelopers: totalDevelopers[0].count,
            totalLeads: totalLeads[0].count,
            totalInquiries: totalInquiries[0].count,
            recentProperties
        };
    }

    async getAdminStats(userId, roleId) {
        let propertyFilter = "";
        let params = [];

        if (roleId === 2) {
            propertyFilter = "AND pv.admin_a_status = 'Pending'";
        } else if (roleId === 3) {
            propertyFilter = "AND pv.admin_b_status = 'Pending'";
        }

        const pendingReview = await executeQuery(
            `SELECT COUNT(*) as count FROM properties p LEFT JOIN property_verification pv ON p.id = pv.property_id WHERE 1=1 ${propertyFilter}`,
            params
        );
        const totalApproved = await executeQuery(
            `SELECT COUNT(*) as count FROM properties p LEFT JOIN property_verification pv ON p.id = pv.property_id WHERE pv.admin_a_status='Approved' OR pv.admin_b_status='Approved' OR pv.super_admin_status='Approved'`
        );
        const totalRejected = await executeQuery(
            `SELECT COUNT(*) as count FROM properties p LEFT JOIN property_verification pv ON p.id = pv.property_id WHERE pv.admin_a_status='Rejected' AND pv.admin_b_status='Rejected'`
        );
        const myActivity = await executeQuery(
            "SELECT * FROM activity_logs WHERE user_id=? ORDER BY created_at DESC LIMIT 20",
            [userId]
        );

        return {
            pendingReview: pendingReview[0].count,
            totalApproved: totalApproved[0].count,
            totalRejected: totalRejected[0].count,
            myActivity
        };
    }

    async getLogs(page = 1, limit = 50) {
        const offset = (page - 1) * limit;
        const logs = await executeQuery(
            `SELECT al.*, u.full_name, u.email, r.role_name
             FROM activity_logs al
             LEFT JOIN users u ON al.user_id = u.id
             LEFT JOIN roles r ON u.role_id = r.id
             ORDER BY al.created_at DESC
             LIMIT ? OFFSET ?`,
            [limit, offset]
        );
        const total = await executeQuery("SELECT COUNT(*) as count FROM activity_logs");
        return { logs, total: total[0].count, page, limit };
    }

    async getPropertyStats() {
        const byStatus = await executeQuery(
            "SELECT property_status, COUNT(*) as count FROM properties GROUP BY property_status"
        );
        const byCity = await executeQuery(
            "SELECT city, COUNT(*) as count FROM properties WHERE property_status='Approved' GROUP BY city ORDER BY count DESC LIMIT 10"
        );
        const byType = await executeQuery(
            "SELECT property_type, COUNT(*) as count FROM properties GROUP BY property_type"
        );
        return { byStatus, byCity, byType };
    }
}

module.exports = new DashboardService();

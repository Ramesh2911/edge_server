const db = require("../config/db");

const executeQuery = async (sql, params = []) => {
    const [results] = await db.query(sql, params);
    return results;
};

class LeadService {
    async createRequirement(data) {
        const sql = `INSERT INTO buyer_requirements (user_id, name, phone, email, title, purpose, property_type, min_budget, max_budget, city, beds, baths, min_area, max_area, amenities, notes)
                     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
        const values = [
            data.user_id || null,
            data.name,
            data.phone,
            data.email || null,
            data.title || null,
            data.purpose || 'Buy',
            data.property_type || null,
            data.min_budget || null,
            data.max_budget || null,
            data.city || null,
            data.beds || null,
            data.baths || null,
            data.min_area || null,
            data.max_area || null,
            data.amenities || null,
            data.notes || null
        ];
        const result = await executeQuery(sql, values);
        return result.insertId;
    }

    async getRequirements(userId = null) {
        if (userId) {
            return await executeQuery(
                "SELECT * FROM buyer_requirements WHERE user_id=? ORDER BY created_at DESC",
                [userId]
            );
        }
        return await executeQuery(
            `SELECT br.*, u.full_name as user_name, u.email as user_email, u.mobile as user_mobile
             FROM buyer_requirements br
             LEFT JOIN users u ON br.user_id = u.id
             ORDER BY br.created_at DESC`
        );
    }

    async getRequirementById(id) {
        const result = await executeQuery("SELECT * FROM buyer_requirements WHERE id=?", [id]);
        return result[0] || null;
    }

    async updateRequirement(id, data, userId = null) {
        const n = (v) => (v === undefined ? null : v);
        let sql = `UPDATE buyer_requirements SET title=?, purpose=?, property_type=?, min_budget=?, max_budget=?, city=?, beds=?, baths=?, min_area=?, max_area=?, amenities=?, notes=?, status=?`;
        let values = [n(data.title), n(data.purpose), n(data.property_type), n(data.min_budget), n(data.max_budget), n(data.city), n(data.beds), n(data.baths), n(data.min_area), n(data.max_area), n(data.amenities), n(data.notes), data.status || 'New'];

        if (userId) {
            sql += " WHERE id=? AND user_id=?";
            values.push(id, userId);
        } else {
            sql += " WHERE id=?";
            values.push(id);
        }
        return await executeQuery(sql, values);
    }

    async deleteRequirement(id, userId = null) {
        if (userId) {
            return await executeQuery("DELETE FROM buyer_requirements WHERE id=? AND user_id=?", [id, userId]);
        }
        return await executeQuery("DELETE FROM buyer_requirements WHERE id=?", [id]);
    }

    async getAllInterests() {
        return await executeQuery(
            `SELECT pi.*, p.property_title, p.price, p.city, p.address,
                    u.full_name as buyer_name, u.email as buyer_email, u.mobile as buyer_phone,
                    ou.full_name as owner_name, ou.email as owner_email, ou.mobile as owner_phone
             FROM property_inquiries pi
             LEFT JOIN properties p ON pi.property_id = p.id
             LEFT JOIN users u ON pi.user_id = u.id
             LEFT JOIN users ou ON p.user_id = ou.id
             ORDER BY pi.created_at DESC`
        );
    }

    // ---------- Newsletter subscribers (point 17) ----------

    async subscribeNewsletter(email, source = "website") {
        const result = await executeQuery(
            `INSERT INTO newsletter_subscribers (email, source) VALUES (?,?)
             ON DUPLICATE KEY UPDATE source = VALUES(source)`,
            [email, source]
        );
        return result.insertId || null;
    }

    async getNewsletterSubscribers() {
        return await executeQuery(
            "SELECT * FROM newsletter_subscribers ORDER BY created_at DESC"
        );
    }

    async deleteNewsletterSubscriber(id) {
        return await executeQuery("DELETE FROM newsletter_subscribers WHERE id=?", [id]);
    }

    // ---------- All leads — property-wise / account-wise views (point 17) ----------

    async getAllLeads(view = "account") {
        const requirements = await executeQuery(
            `SELECT 'requirement' AS lead_type, br.id, br.name, br.phone, br.email, br.title, br.city, br.status, br.created_at, NULL AS property_id
             FROM buyer_requirements br`
        );
        const interests = await executeQuery(
            `SELECT 'enquiry' AS lead_type, pi.id, COALESCE(pi.name, u.full_name) AS name,
                    COALESCE(pi.phone, u.mobile) AS phone, COALESCE(pi.email, u.email) AS email,
                    p.property_title AS title, p.city, pi.status, pi.created_at, pi.property_id
             FROM property_inquiries pi
             LEFT JOIN users u ON u.id = pi.user_id
             LEFT JOIN properties p ON p.id = pi.property_id`
        );
        const newsletter = await executeQuery(
            `SELECT 'newsletter' AS lead_type, ns.id, NULL AS name, NULL AS phone, ns.email,
                    NULL AS title, NULL AS city, 'Subscribed' AS status, ns.created_at, NULL AS property_id
             FROM newsletter_subscribers ns`
        );
        const loans = await executeQuery(
            `SELECT 'loan' AS lead_type, la.id, la.name, la.phone, la.email,
                    CONCAT('Loan of ', la.amount) AS title, NULL AS city, 'New' AS status, la.created_at, NULL AS property_id
             FROM loan_applications la`
        );

        const all = [...requirements, ...interests, ...newsletter, ...loans]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        if (view === "property") {
            const grouped = {};
            for (const row of all) {
                const key = row.property_id ? `property_${row.property_id}` : "unassigned";
                if (!grouped[key]) grouped[key] = { group: key, property_id: row.property_id || null, leads: [] };
                grouped[key].leads.push(row);
            }
            return Object.values(grouped);
        }
        return all;
    }
}

module.exports = new LeadService();

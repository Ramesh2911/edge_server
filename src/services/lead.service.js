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
        let sql = `UPDATE buyer_requirements SET title=?, purpose=?, property_type=?, min_budget=?, max_budget=?, city=?, beds=?, baths=?, min_area=?, max_area=?, amenities=?, notes=?, status=?`;
        let values = [data.title, data.purpose, data.property_type, data.min_budget, data.max_budget, data.city, data.beds, data.baths, data.min_area, data.max_area, data.amenities, data.notes, data.status || 'New'];

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
}

module.exports = new LeadService();

const db = require("../config/db");

const executeQuery = async (sql, params = []) => {
    const [results] = await db.query(sql, params);
    return results;
};

class PartnerService {
    // Public — website/app home marquee (point 21: dynamic developer logos)
    async getActive() {
        return await executeQuery(
            "SELECT id, name, logo, website, description, sort_order FROM partner_developers WHERE is_active=1 ORDER BY sort_order ASC, id ASC"
        );
    }

    // Admin — full list
    async getAll() {
        return await executeQuery(
            "SELECT * FROM partner_developers ORDER BY sort_order ASC, id ASC"
        );
    }

    async create(data, logoFile) {
        const logo = logoFile ? `/uploads/partners/${logoFile.filename}` : data.logo || null;
        const result = await executeQuery(
            `INSERT INTO partner_developers (name, logo, website, description, sort_order, is_active)
             VALUES (?,?,?,?,?,?)`,
            [
                data.name,
                logo,
                data.website || null,
                data.description || null,
                Number(data.sort_order) || 0,
                data.is_active === undefined || data.is_active === null ? 1 : Number(data.is_active),
            ]
        );
        return result.insertId;
    }

    async update(id, data, logoFile) {
        const fields = [];
        const values = [];
        if (data.name !== undefined) { fields.push("name=?"); values.push(data.name); }
        if (logoFile) { fields.push("logo=?"); values.push(`/uploads/partners/${logoFile.filename}`); }
        else if (data.logo !== undefined) { fields.push("logo=?"); values.push(data.logo || null); }
        if (data.website !== undefined) { fields.push("website=?"); values.push(data.website || null); }
        if (data.description !== undefined) { fields.push("description=?"); values.push(data.description || null); }
        if (data.sort_order !== undefined) { fields.push("sort_order=?"); values.push(Number(data.sort_order) || 0); }
        if (data.is_active !== undefined) { fields.push("is_active=?"); values.push(Number(data.is_active)); }
        if (fields.length === 0) return null;
        values.push(id);
        return await executeQuery(`UPDATE partner_developers SET ${fields.join(", ")} WHERE id=?`, values);
    }

    async remove(id) {
        return await executeQuery("DELETE FROM partner_developers WHERE id=?", [id]);
    }
}

module.exports = new PartnerService();

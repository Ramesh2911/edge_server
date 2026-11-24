const db = require("../config/db");

const executeQuery = async (sql, params = []) => {
    const [results] = await db.query(sql, params);
    return results;
};

class BannerService {
    // Public — active banners for the home hero slider (point 1: dynamic banner)
    async getActive() {
        return await executeQuery(
            "SELECT id, image, title, subtitle, link, sort_order FROM banners WHERE is_active=1 ORDER BY sort_order ASC, id ASC"
        );
    }

    async getAll() {
        return await executeQuery("SELECT * FROM banners ORDER BY sort_order ASC, id ASC");
    }

    async create(data, file) {
        const image = file ? `/uploads/banner/${file.filename}` : data.image || null;
        if (!image) {
            const err = new Error("Banner image is required");
            err.status = 400;
            throw err;
        }
        const result = await executeQuery(
            "INSERT INTO banners (image, title, subtitle, link, sort_order, is_active) VALUES (?,?,?,?,?,?)",
            [
                image,
                data.title || null,
                data.subtitle || null,
                data.link || null,
                Number(data.sort_order) || 0,
                data.is_active === undefined || data.is_active === null ? 1 : Number(data.is_active),
            ]
        );
        return result.insertId;
    }

    async update(id, data, file) {
        const fields = [];
        const values = [];
        if (file) { fields.push("image=?"); values.push(`/uploads/banner/${file.filename}`); }
        else if (data.image !== undefined) { fields.push("image=?"); values.push(data.image); }
        if (data.title !== undefined) { fields.push("title=?"); values.push(data.title || null); }
        if (data.subtitle !== undefined) { fields.push("subtitle=?"); values.push(data.subtitle || null); }
        if (data.link !== undefined) { fields.push("link=?"); values.push(data.link || null); }
        if (data.sort_order !== undefined) { fields.push("sort_order=?"); values.push(Number(data.sort_order) || 0); }
        if (data.is_active !== undefined) { fields.push("is_active=?"); values.push(Number(data.is_active)); }
        if (fields.length === 0) return null;
        values.push(id);
        return await executeQuery(`UPDATE banners SET ${fields.join(", ")} WHERE id=?`, values);
    }

    async remove(id) {
        return await executeQuery("DELETE FROM banners WHERE id=?", [id]);
    }
}

module.exports = new BannerService();

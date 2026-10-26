const db = require("../config/db");

const executeQuery = async (sql, params = []) => {
    const [results] = await db.query(sql, params);
    return results;
};

const CONTACT_KEYS = ["footer_phone", "footer_email", "footer_address"];

class FooterService {
    async getContact() {
        const rows = await executeQuery(
            "SELECT setting_key, setting_value FROM site_settings WHERE setting_key IN (?,?,?)",
            CONTACT_KEYS
        );
        const map = {};
        for (const row of rows) map[row.setting_key] = row.setting_value;
        return {
            phone: map.footer_phone || "",
            email: map.footer_email || "",
            address: map.footer_address || ""
        };
    }

    async getPublicLinks() {
        return await executeQuery(
            "SELECT id, label, url FROM footer_links WHERE status=1 ORDER BY sort_order ASC, id ASC"
        );
    }

    async getContentBySlug(slug) {
        const clean = String(slug || "").replace(/^\/+/, "").trim();
        if (!clean) return null;
        const rows = await executeQuery(
            "SELECT id, label, url, content FROM footer_links WHERE url=? AND status=1 LIMIT 1",
            [`/${clean}`]
        );
        return rows.length ? rows[0] : null;
    }

    async getPublicFooter() {
        const [contact, links] = await Promise.all([this.getContact(), this.getPublicLinks()]);
        return { contact, links };
    }

    async updateContact({ phone, email, address }) {
        const entries = {
            footer_phone: phone,
            footer_email: email,
            footer_address: address
        };
        for (const key of Object.keys(entries)) {
            await executeQuery(
                `INSERT INTO site_settings (setting_key, setting_value) VALUES (?,?)
                 ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
                [key, entries[key] ?? null]
            );
        }
        return await this.getContact();
    }

    async getAllLinks() {
        return await executeQuery("SELECT * FROM footer_links ORDER BY sort_order ASC, id ASC");
    }

    async createLink(data) {
        const result = await executeQuery(
            `INSERT INTO footer_links (label, url, sort_order, status, content) VALUES (?,?,?,?,?)`,
            [
                data.label,
                data.url || "#",
                data.sort_order !== undefined && data.sort_order !== null && data.sort_order !== ""
                    ? Number(data.sort_order)
                    : 0,
                data.status !== undefined ? Number(data.status) : 1,
                data.content ?? null
            ]
        );
        return result.insertId;
    }

    async updateLink(id, data) {
        await executeQuery(
            `UPDATE footer_links SET label=?, url=?, sort_order=?, status=?, content=? WHERE id=?`,
            [
                data.label,
                data.url || "#",
                data.sort_order !== undefined && data.sort_order !== null && data.sort_order !== ""
                    ? Number(data.sort_order)
                    : 0,
                data.status !== undefined ? Number(data.status) : 1,
                data.content ?? null,
                id
            ]
        );
        return await executeQuery("SELECT * FROM footer_links WHERE id=?", [id]);
    }

    async deleteLink(id) {
        return await executeQuery("DELETE FROM footer_links WHERE id=?", [id]);
    }
}

module.exports = new FooterService();

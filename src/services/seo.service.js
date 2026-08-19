const db = require("../config/db");

const executeQuery = async (sql, params = []) => {
    const [results] = await db.query(sql, params);
    return results;
};

class SeoService {
    async getAllPages() {
        return await executeQuery("SELECT * FROM seo_pages ORDER BY created_at DESC");
    }

    async getPageBySlug(slug) {
        const result = await executeQuery("SELECT * FROM seo_pages WHERE slug=? AND status=1", [slug]);
        return result[0] || null;
    }

    async getPageById(id) {
        const result = await executeQuery("SELECT * FROM seo_pages WHERE id=?", [id]);
        return result[0] || null;
    }

    async createPage(data) {
        const sql = `INSERT INTO seo_pages (title, slug, meta_title, meta_description, content, keywords, status)
                     VALUES (?,?,?,?,?,?,?)`;
        const result = await executeQuery(sql, [
            data.title,
            data.slug,
            data.meta_title || null,
            data.meta_description || null,
            data.content || null,
            data.keywords || null,
            data.status !== undefined ? data.status : 1
        ]);
        return result.insertId;
    }

    async updatePage(id, data) {
        const sql = `UPDATE seo_pages SET title=?, slug=?, meta_title=?, meta_description=?, content=?, keywords=?, status=? WHERE id=?`;
        return await executeQuery(sql, [
            data.title,
            data.slug,
            data.meta_title || null,
            data.meta_description || null,
            data.content || null,
            data.keywords || null,
            data.status !== undefined ? data.status : 1,
            id
        ]);
    }

    async deletePage(id) {
        return await executeQuery("DELETE FROM seo_pages WHERE id=?", [id]);
    }
}

module.exports = new SeoService();

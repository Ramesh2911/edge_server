const db = require("../config/db");

const executeQuery = async (sql, params = []) => {
    const [results] = await db.query(sql, params);
    return results;
};

const slugify = (s) =>
    String(s || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

class BlogService {
    async getPublicPosts() {
        return await executeQuery(
            "SELECT id, title, slug, tag, post_date, excerpt, image_url FROM blog_posts WHERE status=1 ORDER BY post_date DESC, id DESC"
        );
    }

    async getPublicPost(slug) {
        const clean = slugify(slug);
        const rows = await executeQuery(
            "SELECT id, title, slug, tag, post_date, excerpt, image_url FROM blog_posts WHERE slug=? AND status=1 LIMIT 1",
            [clean]
        );
        return rows.length ? rows[0] : null;
    }

    async getAll() {
        return await executeQuery(
            "SELECT * FROM blog_posts ORDER BY post_date DESC, id DESC"
        );
    }

    async create(data) {
        const slug = slugify(data.slug || data.title);
        const result = await executeQuery(
            `INSERT INTO blog_posts (title, slug, tag, post_date, excerpt, image_url, status)
             VALUES (?,?,?,?,?,?,?)`,
            [
                data.title,
                slug,
                data.tag || "",
                data.post_date || null,
                data.excerpt || "",
                data.image_url || "",
                data.status !== undefined ? Number(data.status) : 1
            ]
        );
        return result.insertId;
    }

    async update(id, data) {
        const slug = slugify(data.slug || data.title);
        await executeQuery(
            `UPDATE blog_posts SET title=?, slug=?, tag=?, post_date=?, excerpt=?, image_url=?, status=? WHERE id=?`,
            [
                data.title,
                slug,
                data.tag || "",
                data.post_date || null,
                data.excerpt || "",
                data.image_url || "",
                data.status !== undefined ? Number(data.status) : 1,
                id
            ]
        );
        return await executeQuery("SELECT * FROM blog_posts WHERE id=?", [id]);
    }

    async delete(id) {
        return await executeQuery("DELETE FROM blog_posts WHERE id=?", [id]);
    }
}

module.exports = new BlogService();

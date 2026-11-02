const blogService = require("../services/blog.service");
const response = require("../helpers/response");
const { blogImage } = require("../helpers/upload");

const buildPayload = (body, file) => {
    const data = { ...body };
    if (file) {
        data.image_url = blogImage(file.filename);
    }
    if (data.post_date === "" || data.post_date === undefined) {
        data.post_date = null;
    }
    return data;
};

class BlogController {
    async getPublicPosts(req, res) {
        try {
            const data = await blogService.getPublicPosts();
            return response.success(res, "Blog posts loaded", data);
        } catch (err) { return response.error(res, err.message, 500); }
    }

    async getPublicPost(req, res) {
        try {
            const data = await blogService.getPublicPost(req.params.slug);
            if (!data) return response.error(res, "Post not found", 404);
            return response.success(res, "Blog post loaded", data);
        } catch (err) { return response.error(res, err.message, 500); }
    }

    async getAll(req, res) {
        try {
            const data = await blogService.getAll();
            return response.success(res, "Blog posts loaded", data);
        } catch (err) { return response.error(res, err.message, 500); }
    }

    async create(req, res) {
        try {
            const payload = buildPayload(req.body, req.file);
            const { title } = payload;
            if (!title || !String(title).trim()) {
                return response.error(res, "Title is required", 422);
            }
            const id = await blogService.create(payload);
            return response.success(res, "Blog post created successfully", { id }, 201);
        } catch (err) {
            if (err.code === "ER_DUP_ENTRY") return response.error(res, "A post with this title already exists", 409);
            return response.error(res, err.message, 500);
        }
    }

    async update(req, res) {
        try {
            const payload = buildPayload(req.body, req.file);
            const { title } = payload;
            if (!title || !String(title).trim()) {
                return response.error(res, "Title is required", 422);
            }
            const data = await blogService.update(req.params.id, payload);
            if (!data.length) return response.error(res, "Blog post not found", 404);
            return response.success(res, "Blog post updated successfully", data[0]);
        } catch (err) {
            if (err.code === "ER_DUP_ENTRY") return response.error(res, "A post with this title already exists", 409);
            return response.error(res, err.message, 500);
        }
    }

    async delete(req, res) {
        try {
            const result = await blogService.delete(req.params.id);
            if (!result.affectedRows) return response.error(res, "Blog post not found", 404);
            return response.success(res, "Blog post deleted successfully");
        } catch (err) { return response.error(res, err.message, 500); }
    }
}

module.exports = new BlogController();

const bannerService = require("../services/banner.service");
const response = require("../helpers/response");

class BannerController {
    // Public — GET /banners
    async list(req, res) {
        try {
            const data = await bannerService.getActive();
            return response.success(res, "Banners loaded", data);
        } catch (err) { return response.error(res, err.message, 500); }
    }

    // Admin — GET /banners/admin
    async listAll(req, res) {
        try {
            const data = await bannerService.getAll();
            return response.success(res, "Banners loaded", data);
        } catch (err) { return response.error(res, err.message, 500); }
    }

    // Admin — POST /banners (multipart: banner_image)
    async create(req, res) {
        try {
            const id = await bannerService.create(req.body || {}, req.file);
            return response.success(res, "Banner created", { id }, 201);
        } catch (err) { return response.error(res, err.message, err.status || 500); }
    }

    // Admin — PUT /banners/:id
    async update(req, res) {
        try {
            const result = await bannerService.update(req.params.id, req.body || {}, req.file);
            if (!result) return response.error(res, "Nothing to update", 400);
            return response.success(res, "Banner updated");
        } catch (err) { return response.error(res, err.message, err.status || 500); }
    }

    // Admin — DELETE /banners/:id
    async remove(req, res) {
        try {
            await bannerService.remove(req.params.id);
            return response.success(res, "Banner deleted");
        } catch (err) { return response.error(res, err.message, 500); }
    }
}

module.exports = new BannerController();

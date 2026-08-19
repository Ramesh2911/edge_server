const seoService = require("../services/seo.service");
const response = require("../helpers/response");

class SeoController {
    async getAllPages(req, res) {
        try {
            const data = await seoService.getAllPages();
            return response.success(res, "SEO pages loaded", data);
        } catch (err) { return response.error(res, err.message, 500); }
    }

    async getPageBySlug(req, res) {
        try {
            const data = await seoService.getPageBySlug(req.params.slug);
            if (!data) return response.error(res, "SEO page not found", 404);
            return response.success(res, "SEO page loaded", data);
        } catch (err) { return response.error(res, err.message, 500); }
    }

    async getPageById(req, res) {
        try {
            const data = await seoService.getPageById(req.params.id);
            if (!data) return response.error(res, "SEO page not found", 404);
            return response.success(res, "SEO page loaded", data);
        } catch (err) { return response.error(res, err.message, 500); }
    }

    async createPage(req, res) {
        try {
            const id = await seoService.createPage(req.body);
            return response.success(res, "SEO page created successfully", { id }, 201);
        } catch (err) { return response.error(res, err.message, 500); }
    }

    async updatePage(req, res) {
        try {
            await seoService.updatePage(req.params.id, req.body);
            return response.success(res, "SEO page updated successfully");
        } catch (err) { return response.error(res, err.message, 500); }
    }

    async deletePage(req, res) {
        try {
            await seoService.deletePage(req.params.id);
            return response.success(res, "SEO page deleted successfully");
        } catch (err) { return response.error(res, err.message, 500); }
    }
}

module.exports = new SeoController();

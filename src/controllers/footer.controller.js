const footerService = require("../services/footer.service");
const response = require("../helpers/response");

class FooterController {
    async getFooter(req, res) {
        try {
            const data = await footerService.getPublicFooter();
            return response.success(res, "Footer loaded", data);
        } catch (err) { return response.error(res, err.message, 500); }
    }

    async getLinkContent(req, res) {
        try {
            const data = await footerService.getContentBySlug(req.params.slug);
            if (!data) return response.error(res, "Page not found", 404);
            return response.success(res, "Page content loaded", data);
        } catch (err) { return response.error(res, err.message, 500); }
    }

    async getContact(req, res) {
        try {
            const data = await footerService.getContact();
            return response.success(res, "Footer contact loaded", data);
        } catch (err) { return response.error(res, err.message, 500); }
    }

    async updateContact(req, res) {
        try {
            const { phone, email, address } = req.body;
            if (!phone || !email || !address) {
                return response.error(res, "Phone, email and address are required", 422);
            }
            const data = await footerService.updateContact({ phone, email, address });
            return response.success(res, "Footer contact updated successfully", data);
        } catch (err) { return response.error(res, err.message, 500); }
    }

    async getAllLinks(req, res) {
        try {
            const data = await footerService.getAllLinks();
            return response.success(res, "Footer links loaded", data);
        } catch (err) { return response.error(res, err.message, 500); }
    }

    async createLink(req, res) {
        try {
            const { label } = req.body;
            if (!label || !String(label).trim()) {
                return response.error(res, "Label is required", 422);
            }
            const id = await footerService.createLink(req.body);
            return response.success(res, "Footer link created successfully", { id }, 201);
        } catch (err) {
            if (err.code === "ER_DUP_ENTRY") return response.error(res, "Link label already exists", 409);
            return response.error(res, err.message, 500);
        }
    }

    async updateLink(req, res) {
        try {
            const { label } = req.body;
            if (!label || !String(label).trim()) {
                return response.error(res, "Label is required", 422);
            }
            const data = await footerService.updateLink(req.params.id, req.body);
            if (!data.length) return response.error(res, "Footer link not found", 404);
            return response.success(res, "Footer link updated successfully", data[0]);
        } catch (err) {
            if (err.code === "ER_DUP_ENTRY") return response.error(res, "Link label already exists", 409);
            return response.error(res, err.message, 500);
        }
    }

    async deleteLink(req, res) {
        try {
            const result = await footerService.deleteLink(req.params.id);
            if (!result.affectedRows) return response.error(res, "Footer link not found", 404);
            return response.success(res, "Footer link deleted successfully");
        } catch (err) { return response.error(res, err.message, 500); }
    }
}

module.exports = new FooterController();

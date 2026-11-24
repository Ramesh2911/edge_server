const partnerService = require("../services/partner.service");
const response = require("../helpers/response");

class PartnerController {
    // Public — GET /partners
    async list(req, res) {
        try {
            const data = await partnerService.getActive();
            return response.success(res, "Partner developers loaded", data);
        } catch (err) { return response.error(res, err.message, 500); }
    }

    // Admin — GET /partners/admin
    async listAll(req, res) {
        try {
            const data = await partnerService.getAll();
            return response.success(res, "Partner developers loaded", data);
        } catch (err) { return response.error(res, err.message, 500); }
    }

    // Admin — POST /partners
    async create(req, res) {
        try {
            if (!req.body || !req.body.name || !String(req.body.name).trim()) {
                return response.error(res, "Name is required", 400);
            }
            const id = await partnerService.create(req.body, req.file);
            return response.success(res, "Partner developer created", { id }, 201);
        } catch (err) { return response.error(res, err.message, 500); }
    }

    // Admin — PUT /partners/:id
    async update(req, res) {
        try {
            const result = await partnerService.update(req.params.id, req.body, req.file);
            if (!result) return response.error(res, "Nothing to update", 400);
            return response.success(res, "Partner developer updated");
        } catch (err) { return response.error(res, err.message, 500); }
    }

    // Admin — DELETE /partners/:id
    async remove(req, res) {
        try {
            await partnerService.remove(req.params.id);
            return response.success(res, "Partner developer deleted");
        } catch (err) { return response.error(res, err.message, 500); }
    }
}

module.exports = new PartnerController();

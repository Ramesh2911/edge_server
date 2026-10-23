const siteVisitService = require("../services/siteVisit.service");
const activityService = require("../services/activity.service");
const response = require("../helpers/response");

class SiteVisitController {
    async getVisits(req, res) {
        if (!req.user) return response.error(res, "Unauthorized", 401);
        try {
            const data = await siteVisitService.getVisitsByUser(req.user.id);
            return response.success(res, "Site visits loaded", data);
        } catch (err) { return response.error(res, err.message, 500); }
    }

    async createVisit(req, res) {
        if (!req.user) return response.error(res, "Unauthorized", 401);
        try {
            const id = await siteVisitService.createVisit(req.user.id, req.body);
            return response.success(res, "Site visit scheduled successfully", { id }, 201);
        } catch (err) {
            const code = /not found/i.test(err.message) ? 404 : /own property/i.test(err.message) ? 403 : 500;
            return response.error(res, err.message, code);
        }
    }

    async updateVisitStatus(req, res) {
        if (!req.user) return response.error(res, "Unauthorized", 401);
        try {
            const data = await siteVisitService.updateVisitStatus(req.params.id, req.user.id, req.body.status);
            return response.success(res, "Site visit status updated", data);
        } catch (err) {
            const code = /not found/i.test(err.message) ? 404 : /cannot|only cancel/i.test(err.message) ? 403 : 500;
            return response.error(res, err.message, code);
        }
    }

    async removeVisit(req, res) {
        if (!req.user) return response.error(res, "Unauthorized", 401);
        try {
            const data = await siteVisitService.removeVisit(req.params.id, req.user.id);
            return response.success(res, "Site visit removed", data);
        } catch (err) {
            const code = /not found/i.test(err.message) ? 404 : /cannot/i.test(err.message) ? 403 : 500;
            return response.error(res, err.message, code);
        }
    }
}

module.exports = new SiteVisitController();

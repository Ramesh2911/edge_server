const dealService = require("../services/deal.service");
const activityService = require("../services/activity.service");
const response = require("../helpers/response");

class DealController {
    async getDeals(req, res) {
        if (!req.user) return response.error(res, "Unauthorized", 401);
        try {
            const data = await dealService.getDealsByUser(req.user.id);
            return response.success(res, "Deals loaded", data);
        } catch (err) { return response.error(res, err.message, 500); }
    }

    async createDeal(req, res) {
        if (!req.user) return response.error(res, "Unauthorized", 401);
        try {
            const id = await dealService.createDeal(req.user.id, req.body);
            try {
                await activityService.logActivity(req.user.id, "DEAL_CREATED", "deal", id, "New deal created", req.ip);
            } catch (e) { /* silent */ }
            return response.success(res, "Deal created successfully", { id }, 201);
        } catch (err) {
            const code = /not found/i.test(err.message) ? 404 : 500;
            return response.error(res, err.message, code);
        }
    }

    async updateDealStage(req, res) {
        if (!req.user) return response.error(res, "Unauthorized", 401);
        try {
            const data = await dealService.updateDealStage(req.params.id, req.user.id, req.body.stage);
            return response.success(res, "Deal stage updated", data);
        } catch (err) {
            const code = /not found/i.test(err.message) ? 404 : /cannot/i.test(err.message) ? 403 : 500;
            return response.error(res, err.message, code);
        }
    }

    async removeDeal(req, res) {
        if (!req.user) return response.error(res, "Unauthorized", 401);
        try {
            const data = await dealService.removeDeal(req.params.id, req.user.id);
            return response.success(res, "Deal removed", data);
        } catch (err) {
            const code = /not found/i.test(err.message) ? 404 : /cannot/i.test(err.message) ? 403 : 500;
            return response.error(res, err.message, code);
        }
    }
}

module.exports = new DealController();

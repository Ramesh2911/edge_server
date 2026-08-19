const leadService = require("../services/lead.service");
const activityService = require("../services/activity.service");
const notificationService = require("../services/notification.service");
const response = require("../helpers/response");

class LeadController {
    async createRequirement(req, res) {
        try {
            const data = { ...req.body, user_id: req.user ? req.user.id : null };
            const id = await leadService.createRequirement(data);
            if (req.user) {
                await activityService.logActivity(req.user.id, "BUYER_REQUIREMENT_CREATED", "buyer_requirement", id, `New buyer requirement submitted`, req.ip);
            }
            return response.success(res, "Buyer requirement submitted successfully", { id }, 201);
        } catch (err) { return response.error(res, err.message, 500); }
    }

    async getRequirements(req, res) {
        try {
            const userId = req.user.role_id === 1 ? null : req.user.id;
            const data = await leadService.getRequirements(userId);
            return response.success(res, "Buyer requirements loaded", data);
        } catch (err) { return response.error(res, err.message, 500); }
    }

    async getRequirementById(req, res) {
        try {
            const data = await leadService.getRequirementById(req.params.id);
            if (!data) return response.error(res, "Requirement not found", 404);
            return response.success(res, "Requirement details loaded", data);
        } catch (err) { return response.error(res, err.message, 500); }
    }

    async updateRequirement(req, res) {
        try {
            const userId = req.user.role_id === 1 ? null : req.user.id;
            await leadService.updateRequirement(req.params.id, req.body, userId);
            return response.success(res, "Requirement updated successfully");
        } catch (err) { return response.error(res, err.message, 500); }
    }

    async deleteRequirement(req, res) {
        try {
            const userId = req.user.role_id === 1 ? null : req.user.id;
            await leadService.deleteRequirement(req.params.id, userId);
            return response.success(res, "Requirement deleted successfully");
        } catch (err) { return response.error(res, err.message, 500); }
    }

    async getAllInterests(req, res) {
        try {
            const data = await leadService.getAllInterests();
            return response.success(res, "All interests/pokes loaded", data);
        } catch (err) { return response.error(res, err.message, 500); }
    }
}

module.exports = new LeadController();

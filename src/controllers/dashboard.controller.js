const dashboardService = require("../services/dashboard.service");
const response = require("../helpers/response");

class DashboardController {
    async getSuperAdminStats(req, res) {
        try {
            const data = await dashboardService.getSuperAdminStats();
            return response.success(res, "Super Admin dashboard stats loaded", data);
        } catch (err) { return response.error(res, err.message, 500); }
    }

    async getAdminStats(req, res) {
        try {
            const data = await dashboardService.getAdminStats(req.user.id, req.user.role_id);
            return response.success(res, "Admin dashboard stats loaded", data);
        } catch (err) { return response.error(res, err.message, 500); }
    }

    async getLogs(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            const search = (req.query.search || "").toString().trim().slice(0, 120);
            const role = (req.query.role || "").toString().trim().slice(0, 60);
            const type = (req.query.type || "").toString().trim().slice(0, 60);
            const from = /^\d{4}-\d{2}-\d{2}$/.test(req.query.from || "")
                ? req.query.from
                : "";
            const to = /^\d{4}-\d{2}-\d{2}$/.test(req.query.to || "")
                ? req.query.to
                : "";
            const data = await dashboardService.getLogs(page, limit, {
                search,
                role,
                type,
                from,
                to,
            });
            return response.success(res, "Activity logs loaded", data);
        } catch (err) { return response.error(res, err.message, 500); }
    }

    async getPropertyStats(req, res) {
        try {
            const data = await dashboardService.getPropertyStats();
            return response.success(res, "Property stats loaded", data);
        } catch (err) { return response.error(res, err.message, 500); }
    }
}

module.exports = new DashboardController();

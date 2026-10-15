const settingService = require("../services/setting.service");
const activityService = require("../services/activity.service");
const response = require("../helpers/response");

const RANGES = {
    revenue_percent: [0, 100],
    token_hours: [1, 720],
};

class SettingController {
    async getSettings(req, res) {
        try {
            const data = await settingService.getAll();
            return response.success(res, "Settings loaded", data);
        } catch (err) { return response.error(res, err.message, 500); }
    }

    async updateSettings(req, res) {
        try {
            const body = req.body || {};
            const entries = {};

            if (body.platform_name !== undefined) {
                const name = String(body.platform_name).trim();
                if (name.length < 3 || name.length > 100)
                    return response.error(res, "Platform name must be 3-100 characters", 400);
                entries.platform_name = name;
            }

            for (const [key, [min, max]] of Object.entries(RANGES)) {
                if (body[key] === undefined) continue;
                const n = Number(body[key]);
                if (!Number.isFinite(n) || n < min || n > max)
                    return response.error(res, `${key.replace("_", " ")} must be between ${min} and ${max}`, 400);
                entries[key] = String(n);
            }

            if (!Object.keys(entries).length)
                return response.error(res, "No valid settings provided", 400);

            const data = await settingService.upsertMany(entries);
            await activityService.logActivity(
                req.user.id,
                "SETTINGS_UPDATED",
                "settings",
                null,
                `Updated platform settings: ${Object.keys(entries).join(", ")}`,
                req.ip
            );
            return response.success(res, "Settings updated successfully", data);
        } catch (err) { return response.error(res, err.message, 500); }
    }
}

module.exports = new SettingController();

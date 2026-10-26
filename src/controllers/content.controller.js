const settingService = require("../services/setting.service");
const activityService = require("../services/activity.service");
const response = require("../helpers/response");

// Only these key families are public website content
const PUBLIC_PREFIXES = ["about_", "contact_", "legal_"];

class ContentController {
    async getPublicContent(req, res) {
        try {
            const all = await settingService.getAll();
            const data = {};
            for (const key of Object.keys(all)) {
                if (PUBLIC_PREFIXES.some((p) => key.startsWith(p))) {
                    data[key] = all[key] ?? "";
                }
            }
            return response.success(res, "Content loaded", data);
        } catch (err) {
            return response.error(res, err.message, 500);
        }
    }

    // Super Admin: update about_*/contact_*/legal_* content keys
    async updateContent(req, res) {
        try {
            const body = req.body || {};
            const entries = {};
            for (const key of Object.keys(body)) {
                if (PUBLIC_PREFIXES.some((p) => key.startsWith(p))) {
                    entries[key] = body[key] === null || body[key] === undefined
                        ? ""
                        : String(body[key]);
                }
            }
            if (!Object.keys(entries).length) {
                return response.error(res, "No valid content keys provided", 400);
            }
            const data = await settingService.upsertMany(entries);
            await activityService.logActivity(
                req.user.id,
                "CONTENT_UPDATED",
                "content",
                null,
                `Updated page content: ${Object.keys(entries).join(", ")}`,
                req.ip
            );
            const publicData = {};
            for (const key of Object.keys(data)) {
                if (PUBLIC_PREFIXES.some((p) => key.startsWith(p))) {
                    publicData[key] = data[key] ?? "";
                }
            }
            return response.success(res, "Content updated successfully", publicData);
        } catch (err) {
            return response.error(res, err.message, 500);
        }
    }
}

module.exports = new ContentController();

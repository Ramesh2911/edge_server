const settingService = require("../services/setting.service");
const activityService = require("../services/activity.service");
const response = require("../helpers/response");
const fs = require("fs");
const path = require("path");

const GALLERY_FOLDER = "uploads/content/gallery";
const GALLERY_URL_PREFIX = `/uploads/content/gallery/`;

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

    // Super Admin: upload About gallery image(s) → relative /uploads path
    async uploadGallery(req, res) {
        try {
            const files = req.files || [];
            if (!files.length) {
                return response.error(res, "At least one image file is required", 400);
            }
            const images = files.map((f) => `${GALLERY_URL_PREFIX}${f.filename}`);
            await activityService.logActivity(
                req.user.id,
                "CONTENT_GALLERY_UPLOADED",
                "content",
                null,
                `Uploaded ${images.length} gallery image(s)`,
                req.ip
            );
            return response.success(res, "Image uploaded", { images }, 201);
        } catch (err) {
            return response.error(res, err.message, 500);
        }
    }

    // Super Admin: delete an uploaded gallery file (only under gallery folder)
    async deleteGalleryImage(req, res) {
        try {
            const url = String((req.body && req.body.url) || "").trim();
            if (!url.startsWith(GALLERY_URL_PREFIX)) {
                return response.error(res, "Invalid gallery image path", 400);
            }
            const name = path.basename(url);
            const filePath = path.join(GALLERY_FOLDER, name);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            return response.success(res, "Image deleted");
        } catch (err) {
            return response.error(res, err.message, 500);
        }
    }
}

module.exports = new ContentController();

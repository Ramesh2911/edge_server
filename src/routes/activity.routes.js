const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth.middleware");
const activityService = require("../services/activity.service");
const response = require("../helpers/response");

// Current user's own activity feed
router.get("/", verifyToken, async (req, res) => {
    try {
        const data = await activityService.getActivitiesByUser(req.user.id, 20);
        return response.success(res, "Activity feed loaded", data);
    } catch (err) {
        return response.error(res, err.message, 500);
    }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");
const verifyToken = require("../middleware/auth.middleware");

router.get("/", verifyToken, notificationController.getNotifications);
router.get("/unread-count", verifyToken, notificationController.getUnreadCount);
router.patch("/read/:id", verifyToken, notificationController.markAsRead);
router.patch("/read-all", verifyToken, notificationController.markAllAsRead);

module.exports = router;

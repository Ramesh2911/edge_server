const notificationService = require("../services/notification.service");
const response = require("../helpers/response");

class NotificationController {
    async getNotifications(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const data = await notificationService.getForUser(req.user.id, page, limit);
            return response.success(res, "Notifications loaded", data);
        } catch (err) { return response.error(res, err.message, 500); }
    }

    async markAsRead(req, res) {
        try {
            await notificationService.markAsRead(req.params.id, req.user.id);
            return response.success(res, "Notification marked as read");
        } catch (err) { return response.error(res, err.message, 500); }
    }

    async markAllAsRead(req, res) {
        try {
            await notificationService.markAllAsRead(req.user.id);
            return response.success(res, "All notifications marked as read");
        } catch (err) { return response.error(res, err.message, 500); }
    }

    async getUnreadCount(req, res) {
        try {
            const count = await notificationService.getUnreadCount(req.user.id);
            return response.success(res, "Unread count", { count });
        } catch (err) { return response.error(res, err.message, 500); }
    }
}

module.exports = new NotificationController();

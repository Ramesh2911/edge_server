const db = require("../config/db");

const executeQuery = async (sql, params = []) => {
    const [results] = await db.query(sql, params);
    return results;
};

class SiteVisitService {
    async getVisitsByUser(userId) {
        return await executeQuery(
            `SELECT sv.*, p.property_title, p.city, p.address, p.state,
                    p.user_id AS owner_id,
                    CASE WHEN sv.user_id = ? THEN 'sent' ELSE 'received' END AS direction,
                    requester.full_name AS requester_name, requester.mobile AS requester_mobile,
                    owner.full_name AS owner_name, owner.mobile AS owner_mobile
             FROM site_visits sv
             JOIN properties p ON p.id = sv.property_id
             LEFT JOIN users requester ON requester.id = sv.user_id
             LEFT JOIN users owner ON owner.id = p.user_id
             WHERE sv.user_id = ? OR p.user_id = ?
             ORDER BY sv.created_at DESC`,
            [userId, userId, userId]
        );
    }

    async createVisit(userId, data) {
        const props = await executeQuery("SELECT id, user_id, property_title FROM properties WHERE id = ?", [data.propertyId]);
        if (!props.length) throw new Error("Property not found");
        if (Number(props[0].user_id) === Number(userId)) throw new Error("You cannot schedule a visit on your own property");

        const result = await executeQuery(
            `INSERT INTO site_visits (property_id, user_id, visit_date, visit_time, notes)
             VALUES (?,?,?,?,?)`,
            [data.propertyId, userId, data.visitDate, data.visitTime, data.notes || null]
        );

        // Notify property owner
        try {
            if (props[0].user_id) {
                const notificationService = require("./notification.service");
                const visitor = await executeQuery("SELECT full_name FROM users WHERE id = ?", [userId]);
                const visitorName = visitor[0] ? visitor[0].full_name : "A user";
                await notificationService.create(
                    props[0].user_id,
                    "SITE_VISIT",
                    "New Site Visit Request",
                    `${visitorName} requested a site visit for "${props[0].property_title}" on ${data.visitDate}`,
                    "property",
                    Number(data.propertyId)
                );
            }
        } catch (e) { /* silent */ }

        try {
            const activityService = require("./activity.service");
            await activityService.logActivity(userId, "SITE_VISIT_SCHEDULED", "property", Number(data.propertyId), `Site visit scheduled`, null);
        } catch (e) { /* silent */ }

        return result.insertId;
    }

    async updateVisitStatus(visitId, userId, status) {
        const rows = await executeQuery(
            `SELECT sv.id, sv.user_id AS requester_id, p.user_id AS owner_id
             FROM site_visits sv JOIN properties p ON p.id = sv.property_id WHERE sv.id = ?`,
            [visitId]
        );
        if (!rows.length) throw new Error("Site visit not found");

        const isRequester = Number(rows[0].requester_id) === Number(userId);
        const isOwner = Number(rows[0].owner_id) === Number(userId);
        if (!isRequester && !isOwner) throw new Error("You cannot update this site visit");
        if (isRequester && !isOwner && status !== "Cancelled") {
            throw new Error("You can only cancel your site visit");
        }

        await executeQuery("UPDATE site_visits SET status = ? WHERE id = ?", [status, visitId]);

        // Notify requester when owner changes the status
        if (isOwner && !isRequester) {
            try {
                const visit = await executeQuery(
                    `SELECT sv.user_id, sv.property_id, p.property_title FROM site_visits sv
                     JOIN properties p ON p.id = sv.property_id WHERE sv.id = ?`,
                    [visitId]
                );
                if (visit.length) {
                    const notificationService = require("./notification.service");
                    await notificationService.create(
                        visit[0].user_id,
                        "SITE_VISIT",
                        "Site Visit Updated",
                        `Your site visit for "${visit[0].property_title}" is now ${status.toLowerCase()}`,
                        "property",
                        Number(visit[0].property_id)
                    );
                }
            } catch (e) { /* silent */ }
        }

        return { id: Number(visitId), status };
    }

    async removeVisit(visitId, userId) {
        const rows = await executeQuery(
            `SELECT sv.id, sv.user_id AS requester_id, p.user_id AS owner_id
             FROM site_visits sv JOIN properties p ON p.id = sv.property_id WHERE sv.id = ?`,
            [visitId]
        );
        if (!rows.length) throw new Error("Site visit not found");
        if (Number(rows[0].requester_id) !== Number(userId) && Number(rows[0].owner_id) !== Number(userId)) {
            throw new Error("You cannot remove this site visit");
        }
        await executeQuery("DELETE FROM site_visits WHERE id = ?", [visitId]);
        return { id: Number(visitId) };
    }
}

module.exports = new SiteVisitService();

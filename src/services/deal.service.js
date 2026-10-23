const db = require("../config/db");

const executeQuery = async (sql, params = []) => {
    const [results] = await db.query(sql, params);
    return results;
};

class DealService {
    async getDealsByUser(userId) {
        return await executeQuery(
            `SELECT d.*, p.property_title, p.price AS property_price, p.city, p.address, p.property_status,
                    p.user_id AS owner_id
             FROM deals d
             JOIN properties p ON p.id = d.property_id
             WHERE d.user_id = ?
             ORDER BY d.updated_at DESC`,
            [userId]
        );
    }

    async createDeal(userId, data) {
        const props = await executeQuery("SELECT id FROM properties WHERE id = ?", [data.propertyId]);
        if (!props.length) throw new Error("Property not found");

        const result = await executeQuery(
            `INSERT INTO deals (user_id, property_id, buyer_name, buyer_phone, deal_value, stage, notes)
             VALUES (?,?,?,?,?,?,?)`,
            [
                userId,
                data.propertyId,
                data.buyerName,
                data.buyerPhone || null,
                data.dealValue,
                data.stage || "initial",
                data.notes || null
            ]
        );
        return result.insertId;
    }

    async updateDealStage(dealId, userId, stage) {
        const rows = await executeQuery("SELECT id, user_id FROM deals WHERE id = ?", [dealId]);
        if (!rows.length) throw new Error("Deal not found");
        if (Number(rows[0].user_id) !== Number(userId)) throw new Error("You cannot update this deal");
        await executeQuery("UPDATE deals SET stage = ? WHERE id = ?", [stage, dealId]);
        return { id: Number(dealId), stage };
    }

    async removeDeal(dealId, userId) {
        const rows = await executeQuery("SELECT id, user_id FROM deals WHERE id = ?", [dealId]);
        if (!rows.length) throw new Error("Deal not found");
        if (Number(rows[0].user_id) !== Number(userId)) throw new Error("You cannot remove this deal");
        await executeQuery("DELETE FROM deals WHERE id = ?", [dealId]);
        return { id: Number(dealId) };
    }
}

module.exports = new DealService();

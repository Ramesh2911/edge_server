const db = require("../config/db");

const executeQuery = async (sql, params = []) => {
    const [results] = await db.query(sql, params);
    return results;
};

class PropertyService {
    async getAllAmenities() { return await executeQuery("SELECT * FROM amenities WHERE status = 1"); }
    async getAllCategories() { return await executeQuery("SELECT * FROM property_categories WHERE status = 1"); }

    async createProperty(data, userId, files) {
        const sql = `INSERT INTO properties (user_id, category_id, property_title, property_for, property_type, price, area, area_unit, bedroom, bathroom, balcony, parking, furnishing, ownership, construction_status, possession_date, description, address, city, state, country, pincode, latitude, longitude, property_status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'Pending')`;
        const values = [userId, data.category_id, data.property_title, data.property_for, data.property_type, data.price, data.area, data.area_unit, data.bedroom || 0, data.bathroom || 0, data.balcony || 0, data.parking || 0, data.furnishing, data.ownership, data.construction_status, data.possession_date || null, data.description, data.address, data.city, data.state, data.country, data.pincode, data.latitude || null, data.longitude || null];
        const res = await executeQuery(sql, values);

        await executeQuery("INSERT INTO property_verification (property_id) VALUES (?)", [res.insertId]);
        if (files && files.property_images) {
            for (let f of files.property_images) await executeQuery("INSERT INTO property_images (property_id, image) VALUES (?,?)", [res.insertId, f.filename]);
        }
        return res.insertId;
    }

    async updateProperty(id, data, userId) {
        const sql = `UPDATE properties SET category_id=?, property_title=?, property_for=?, property_type=?, price=?, area=?, area_unit=?, bedroom=?, bathroom=?, balcony=?, parking=?, furnishing=?, ownership=?, construction_status=?, possession_date=?, description=?, address=?, city=?, state=?, country=?, pincode=? WHERE id=? AND user_id=?`;
        return await executeQuery(sql, [data.category_id, data.property_title, data.property_for, data.property_type, data.price, data.area, data.area_unit, data.bedroom, data.bathroom, data.balcony, data.parking, data.furnishing, data.ownership, data.construction_status, data.possession_date, data.description, data.address, data.city, data.state, data.country, data.pincode, id, userId]);
    }

    async deleteProperty(id, userId) { return await executeQuery("DELETE FROM properties WHERE id=? AND user_id=?", [id, userId]); }
    async getProperties() { return await executeQuery("SELECT * FROM properties WHERE property_status='Approved'"); }
    async getPropertyById(id) { const res = await executeQuery("SELECT * FROM properties WHERE id=?", [id]); return res[0] || null; }
    async getMyProperties(userId) { return await executeQuery("SELECT * FROM properties WHERE user_id=?", [userId]); }

    async searchProperty(keyword) { return await executeQuery("SELECT * FROM properties WHERE property_status='Approved' AND (property_title LIKE ? OR description LIKE ?)", [`%${keyword}%`, `%${keyword}%`]); }

    async filterProperty(f) {
        let sql = "SELECT * FROM properties WHERE property_status='Approved'";
        let params = [];
        if (f.type) { sql += " AND property_type=?"; params.push(f.type); }
        if (f.city) { sql += " AND city=?"; params.push(f.city); }
        if (f.minPrice) { sql += " AND price>=?"; params.push(f.minPrice); }
        if (f.maxPrice) { sql += " AND price<=?"; params.push(f.maxPrice); }
        return await executeQuery(sql, params);
    }

    async getFeaturedProperties() { return await executeQuery("SELECT * FROM properties WHERE featured=1 AND property_status='Approved'"); }
    async getLatestProperties() { return await executeQuery("SELECT * FROM properties WHERE property_status='Approved' ORDER BY created_at DESC LIMIT 10"); }

    async getDashboardStats(userId) {
        const total = await executeQuery("SELECT COUNT(*) as count FROM properties WHERE user_id=?", [userId]);
        const approved = await executeQuery("SELECT COUNT(*) as count FROM properties WHERE user_id=? AND property_status='Approved'", [userId]);
        return { total: total[0].count, approved: approved[0].count };
    }

    async addWishlist(userId, propertyId) { return await executeQuery("INSERT IGNORE INTO user_wishlist (user_id, property_id) VALUES (?,?)", [userId, propertyId]); }
    async removeWishlist(userId, propertyId) { return await executeQuery("DELETE FROM user_wishlist WHERE user_id=? AND property_id=?", [userId, propertyId]); }
    async getWishlist(userId) { return await executeQuery("SELECT p.* FROM properties p JOIN user_wishlist w ON p.id = w.property_id WHERE w.user_id=?", [userId]); }

    async addInterest(userId, propertyId, message) { return await executeQuery("INSERT INTO property_inquiries (user_id, property_id, message) VALUES (?,?,?)", [userId, propertyId, message]); }
    async getInterestsForUser(userId) { return await executeQuery("SELECT i.*, p.property_title FROM property_inquiries i JOIN properties p ON i.property_id = p.id WHERE p.user_id=?", [userId]); }

    async updateVerificationStatus(id, status, comment) {
        await executeQuery("UPDATE properties SET property_status=? WHERE id=?", [status, id]);
        return await executeQuery("UPDATE property_verification SET super_admin_status=?, super_admin_comment=? WHERE property_id=?", [status, comment, id]);
    }

    async changeStatus(id, status) { return await executeQuery("UPDATE properties SET property_status=? WHERE id=?", [status, id]); }
    async setFeatured(id, featured) { return await executeQuery("UPDATE properties SET featured=? WHERE id=?", [featured, id]); }
    async getAdminPropertyList() { return await executeQuery("SELECT * FROM properties ORDER BY created_at DESC"); }
}

module.exports = new PropertyService();
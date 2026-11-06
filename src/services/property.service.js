const db = require("../config/db");

const executeQuery = async (sql, params = []) => {
    const [results] = await db.query(sql, params);
    return results;
};

class PropertyService {
    async getAllAmenities() { return await executeQuery("SELECT * FROM amenities WHERE status = 1"); }
    async getAllCategories() { return await executeQuery("SELECT * FROM property_categories WHERE status = 1"); }

    // Amenities admin management
    async getAllAmenitiesAdmin() {
        return await executeQuery(
            `SELECT a.*, (SELECT COUNT(*) FROM property_amenities pa WHERE pa.amenity_id = a.id) AS usage_count
             FROM amenities a ORDER BY a.id ASC`
        );
    }

    async createAmenity(name) {
        const result = await executeQuery("INSERT INTO amenities (amenity_name, status) VALUES (?,1)", [name]);
        return result.insertId;
    }

    async updateAmenity(id, data) {
        return await executeQuery(
            "UPDATE amenities SET amenity_name=?, status=? WHERE id=?",
            [data.amenity_name, data.status, id]
        );
    }

    async countAmenityUsage(id) {
        const rows = await executeQuery("SELECT COUNT(*) AS cnt FROM property_amenities WHERE amenity_id=?", [id]);
        return rows[0] ? rows[0].cnt : 0;
    }

    async deleteAmenity(id) {
        return await executeQuery("DELETE FROM amenities WHERE id=?", [id]);
    }

    async getCityStats() {
        return await executeQuery(
            `SELECT city, COUNT(*) AS count FROM properties
             WHERE property_status='Approved' AND city IS NOT NULL AND city != ''
             GROUP BY city ORDER BY count DESC LIMIT 12`
        );
    }

    // Attach property_images (root-relative paths) to property rows
    async attachImages(list) {
        if (!Array.isArray(list) || list.length === 0) return list;
        const ids = list.map((p) => p.id).filter((id) => id != null);
        if (ids.length === 0) return list;
        const rows = await executeQuery(
            `SELECT property_id, image FROM property_images WHERE property_id IN (${ids.map(() => "?").join(",")}) ORDER BY id ASC`,
            ids
        );
        const map = new Map();
        for (const r of rows) {
            if (!map.has(r.property_id)) map.set(r.property_id, []);
            map.get(r.property_id).push(`/uploads/property/images/${r.image}`);
        }
        return list.map((p) => ({ ...p, images: map.get(p.id) || [] }));
    }

    async attachImage(property) {
        if (!property) return property;
        const withImages = await this.attachImages([property]);
        return withImages[0];
    }

    async attachFloorPlans(property) {
        if (!property) return property;
        const rows = await executeQuery(
            "SELECT image FROM property_floor_plans WHERE property_id=? ORDER BY id ASC",
            [property.id]
        );
        let plans = rows.map((r) => `/uploads/property/floor-plans/${r.image}`);
        if (plans.length === 0 && property.floor_plan) {
            plans = [`/uploads/property/floor-plans/${property.floor_plan}`];
        }
        return {
            ...property,
            floor_plans: plans,
            floor_plan_url: plans[0] || null,
        };
    }

    async attachFloorPlansList(list) {
        if (!Array.isArray(list) || list.length === 0) return list;
        const ids = list.map((p) => p.id).filter((id) => id != null);
        if (ids.length === 0) return list;
        const rows = await executeQuery(
            `SELECT property_id, image FROM property_floor_plans WHERE property_id IN (${ids.map(() => "?").join(",")}) ORDER BY id ASC`,
            ids
        );
        const map = new Map();
        for (const r of rows) {
            if (!map.has(r.property_id)) map.set(r.property_id, []);
            map.get(r.property_id).push(`/uploads/property/floor-plans/${r.image}`);
        }
        return list.map((p) => {
            let plans = map.get(p.id) || [];
            if (plans.length === 0 && p.floor_plan) {
                plans = [`/uploads/property/floor-plans/${p.floor_plan}`];
            }
            return { ...p, floor_plans: plans, floor_plan_url: plans[0] || null };
        });
    }

    async createProperty(data, userId, files) {
        const floorPlans = files && Array.isArray(files.floor_plan) ? files.floor_plan : [];
        const floorPlan = floorPlans[0] ? floorPlans[0].filename : null;
        const sql = `INSERT INTO properties (user_id, category_id, property_title, property_for, property_type, price, area, area_unit, bedroom, bathroom, balcony, parking, furnishing, ownership, construction_status, possession_date, description, address, city, state, country, pincode, latitude, longitude, floor_plan, property_status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'Pending')`;
        const values = [userId, data.category_id, data.property_title, data.property_for, data.property_type, data.price, data.area, data.area_unit, data.bedroom || 0, data.bathroom || 0, data.balcony || 0, data.parking || 0, data.furnishing, data.ownership, data.construction_status, data.possession_date || null, data.description, data.address, data.city, data.state, data.country, data.pincode, data.latitude || null, data.longitude || null, floorPlan];
        const res = await executeQuery(sql, values);

        await executeQuery("INSERT INTO property_verification (property_id) VALUES (?)", [res.insertId]);
        if (files && files.property_images) {
            for (let f of files.property_images) await executeQuery("INSERT INTO property_images (property_id, image) VALUES (?,?)", [res.insertId, f.filename]);
        }
        for (let f of floorPlans) {
            await executeQuery("INSERT INTO property_floor_plans (property_id, image) VALUES (?,?)", [res.insertId, f.filename]);
        }

        // Persist selected amenities (JSON array string from the form)
        if (data.amenities) {
            try {
                const amenityIds = JSON.parse(data.amenities);
                if (Array.isArray(amenityIds)) {
                    for (const rawId of amenityIds) {
                        const amenityId = parseInt(rawId, 10);
                        if (amenityId) await executeQuery("INSERT INTO property_amenities (property_id, amenity_id) VALUES (?,?)", [res.insertId, amenityId]);
                    }
                }
            } catch (e) { /* ignore malformed amenities payload */ }
        }

        // Log activity
        try {
            const activityService = require("./activity.service");
            await activityService.logActivity(userId, "PROPERTY_CREATED", "property", res.insertId, `New property "${data.property_title}" created`, null);
        } catch (e) { /* silent */ }

        return res.insertId;
    }

    async updateProperty(id, data, user, files) {
        const fs = require("fs");
        const userId = user && user.id;
        const roleId = Number(user && user.role_id);
        const isAdmin = roleId === 1 || roleId === 2 || roleId === 3;

        const [[owned]] = await db.query("SELECT id, user_id FROM properties WHERE id=?", [id]);
        if (!owned) {
            const err = new Error("Property not found");
            err.status = 404;
            throw err;
        }
        if (!isAdmin && Number(owned.user_id) !== Number(userId)) {
            const err = new Error("You are not authorized to update this property");
            err.status = 403;
            throw err;
        }

        const newFloorPlans = files && Array.isArray(files.floor_plan) ? files.floor_plan : [];
        const existingRows = await executeQuery(
            "SELECT image FROM property_floor_plans WHERE property_id=? ORDER BY id ASC",
            [id]
        );
        let existingImages = existingRows.map((r) => r.image);
        if (existingImages.length === 0) {
            const [[legacy]] = await db.query("SELECT floor_plan FROM properties WHERE id=?", [id]);
            if (legacy && legacy.floor_plan) existingImages = [legacy.floor_plan];
        }

        const removeOldFloorPlans = (names) => {
            for (const name of names) {
                try { fs.unlinkSync(`uploads/property/floor-plans/${name}`); } catch (e) { /* ignore */ }
            }
        };

        const replaceFloorPlanRows = async (names) => {
            await executeQuery("DELETE FROM property_floor_plans WHERE property_id=?", [id]);
            for (const name of names) {
                await executeQuery(
                    "INSERT INTO property_floor_plans (property_id, image) VALUES (?,?)",
                    [id, name]
                );
            }
        };

        let floorPlan;
        if (newFloorPlans.length > 0) {
            const names = newFloorPlans.map((f) => f.filename);
            removeOldFloorPlans(existingImages);
            await replaceFloorPlanRows(names);
            floorPlan = names[0];
        } else if (data.remove_floor_plan === "1" || data.remove_floor_plan === "true") {
            removeOldFloorPlans(existingImages);
            await executeQuery("DELETE FROM property_floor_plans WHERE property_id=?", [id]);
            floorPlan = null;
        } else if (data.floor_plan !== undefined && data.floor_plan !== null && String(data.floor_plan).trim() !== "") {
            const names = String(data.floor_plan)
                .split(",")
                .map((s) => String(s).split("/").pop().trim())
                .filter(Boolean);
            const toRemove = existingImages.filter((img) => !names.includes(img));
            removeOldFloorPlans(toRemove);
            await replaceFloorPlanRows(names);
            floorPlan = names[0] || null;
        } else {
            if (existingRows.length === 0 && existingImages.length > 0) {
                await replaceFloorPlanRows(existingImages);
            }
            floorPlan = existingImages[0] || null;
        }

        const where = isAdmin ? "id=?" : "id=? AND user_id=?";
        const whereParams = isAdmin ? [id] : [id, userId];
        const sql = `UPDATE properties SET category_id=?, property_title=?, property_for=?, property_type=?, price=?, area=?, area_unit=?, bedroom=?, bathroom=?, balcony=?, parking=?, furnishing=?, ownership=?, construction_status=?, possession_date=?, description=?, address=?, city=?, state=?, country=?, pincode=?, latitude=?, longitude=?, floor_plan=? WHERE ${where}`;
        const result = await executeQuery(sql, [data.category_id, data.property_title, data.property_for, data.property_type, data.price, data.area, data.area_unit, data.bedroom || 0, data.bathroom || 0, data.balcony || 0, data.parking || 0, data.furnishing, data.ownership, data.construction_status, data.possession_date || null, data.description, data.address, data.city, data.state, data.country, data.pincode, data.latitude || null, data.longitude || null, floorPlan, ...whereParams]);
        if (!result.affectedRows) {
            const err = new Error("You are not authorized to update this property");
            err.status = 403;
            throw err;
        }

        if (files && files.property_images) {
            for (let f of files.property_images) await executeQuery("INSERT INTO property_images (property_id, image) VALUES (?,?)", [id, f.filename]);
        }
        // Optional: purge images listed in data.deleted_images (comma-separated filenames or JSON array)
        if (data.deleted_images) {
            let deleted = [];
            try {
                deleted = typeof data.deleted_images === "string" ? JSON.parse(data.deleted_images) : data.deleted_images;
            } catch (e) { deleted = String(data.deleted_images).split(",").filter(Boolean); }
            if (Array.isArray(deleted)) {
                for (const name of deleted) {
                    const base = String(name).split("/").pop();
                    if (!base) continue;
                    await executeQuery("DELETE FROM property_images WHERE property_id=? AND image=?", [id, base]);
                    try { fs.unlinkSync(`uploads/property/images/${base}`); } catch (e) { /* ignore */ }
                }
            }
        }

        // Replace amenities when the client sends an amenities payload (JSON array string)
        if (data.amenities !== undefined && data.amenities !== null && String(data.amenities).trim() !== "") {
            try {
                const amenityIds = JSON.parse(data.amenities);
                if (Array.isArray(amenityIds)) {
                    await executeQuery("DELETE FROM property_amenities WHERE property_id=?", [id]);
                    for (const rawId of amenityIds) {
                        const amenityId = parseInt(rawId, 10);
                        if (amenityId) {
                            await executeQuery(
                                "INSERT INTO property_amenities (property_id, amenity_id) VALUES (?,?)",
                                [id, amenityId]
                            );
                        }
                    }
                }
            } catch (e) { /* ignore malformed amenities payload */ }
        }

        // Owner content edits re-enter the review queue (matches edit-page copy).
        // Admin edits keep the current review state.
        if (!isAdmin) {
            await executeQuery("UPDATE properties SET property_status='Pending' WHERE id=?", [id]);
            await executeQuery(
                `UPDATE property_verification
                 SET admin_a_status='Pending', admin_b_status='Pending', super_admin_status='Pending'
                 WHERE property_id=?`,
                [id]
            );
        }

        try {
            const activityService = require("./activity.service");
            await activityService.logActivity(
                userId,
                "PROPERTY_UPDATED",
                "property",
                id,
                `Property updated: "${data.property_title}"`,
                null
            );
        } catch (e) { /* silent */ }

        return result;
    }

    async deleteProperty(id, userId) {
        const conn = await db.getConnection();
        let filesToRemove = [];
        try {
            await conn.beginTransaction();
            const [owned] = await conn.query("SELECT id FROM properties WHERE id=? AND user_id=?", [id, userId]);
            if (owned.length === 0) {
                await conn.rollback();
                return 0;
            }
            // Collect physical files before removing rows
            const [imgRows] = await conn.query("SELECT image FROM property_images WHERE property_id=?", [id]);
            const [fpRows] = await conn.query("SELECT image FROM property_floor_plans WHERE property_id=?", [id]);
            const [propRows] = await conn.query("SELECT floor_plan FROM properties WHERE id=?", [id]);
            filesToRemove = imgRows.map((r) => `uploads/property/images/${r.image}`);
            for (const r of fpRows) filesToRemove.push(`uploads/property/floor-plans/${r.image}`);
            if (propRows[0] && propRows[0].floor_plan) {
                const legacy = `uploads/property/floor-plans/${propRows[0].floor_plan}`;
                if (!filesToRemove.includes(legacy)) filesToRemove.push(legacy);
            }

            // Remove child rows first — several FKs block a direct parent delete
            const childTables = ["buyer_interest", "deals", "property_amenities", "property_documents", "property_floor_plans", "property_images", "property_verification", "site_visits", "user_wishlist"];
            for (const table of childTables) {
                await conn.query(`DELETE FROM ${table} WHERE property_id=?`, [id]);
            }
            const [res] = await conn.query("DELETE FROM properties WHERE id=?", [id]);
            await conn.commit();

            // Best-effort cleanup of uploaded files (outside the transaction)
            const fs = require("fs");
            for (const file of filesToRemove) {
                try { fs.unlinkSync(file); } catch (e) { /* ignore missing files */ }
            }
            return res.affectedRows;
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    }
    async getProperties() {
        const query = `
        SELECT 
            p.*,
            u.full_name AS poster_name,
            u.mobile AS poster_phone,
            pv.admin_a_status,
            pv.admin_b_status,
            pv.super_admin_status,
            pv.admin_a_comment,
            pv.admin_b_comment,
            pv.super_admin_comment
        FROM properties p
        LEFT JOIN property_verification pv ON p.id = pv.property_id
        LEFT JOIN users u ON u.id = p.user_id
        ORDER BY p.created_at DESC
    `;
        return await executeQuery(query);
    }
    async attachAmenities(property) {
        if (!property) return property;
        const rows = await executeQuery(
            `SELECT pa.amenity_id, a.amenity_name
             FROM property_amenities pa
             JOIN amenities a ON a.id = pa.amenity_id
             WHERE pa.property_id = ?
             ORDER BY a.amenity_name ASC`,
            [property.id]
        );
        return {
            ...property,
            amenities: rows.map((r) => ({ id: r.amenity_id, amenity_name: r.amenity_name })),
            amenity_ids: rows.map((r) => r.amenity_id),
        };
    }

    async getPropertyById(id) {
        const res = await executeQuery(
            `SELECT p.*, u.full_name AS poster_name, u.mobile AS poster_phone
             FROM properties p
             LEFT JOIN users u ON u.id = p.user_id
             WHERE p.id=?`,
            [id]
        );
        const withImages = await this.attachImage(res[0] || null);
        const withPlans = await this.attachFloorPlans(withImages);
        return await this.attachAmenities(withPlans);
    }
    async getMyProperties(userId) {
        const list = await this.attachImages(await executeQuery("SELECT * FROM properties WHERE user_id=?", [userId]));
        return await this.attachFloorPlansList(list);
    }

    async searchProperty(keyword) {
        const kw = String(keyword || "").trim().toLowerCase();
        if (!kw) return [];
        const tokens = kw.split(/\s+/).filter(Boolean);
        const rows = await this.attachImages(
            await executeQuery("SELECT * FROM properties WHERE property_status='Approved'")
        );
        let categoryNameById = {};
        try {
            const cats = await executeQuery("SELECT id, category_name FROM property_categories");
            for (const c of cats) categoryNameById[Number(c.id)] = String(c.category_name || "");
        } catch {
            categoryNameById = {};
        }
        return rows.filter((p) => {
            const text = [
                p.property_title,
                p.description,
                p.address,
                p.city,
                p.state,
                p.property_type,
                p.pincode,
                categoryNameById[Number(p.category_id)] || "",
            ]
                .map((v) => String(v || "").toLowerCase())
                .join(" ");
            return tokens.every((t) => text.includes(t));
        });
    }

    async filterProperty(f) {
        let sql = "SELECT * FROM properties WHERE property_status='Approved'";
        let params = [];
        if (f.type) { sql += " AND property_type=?"; params.push(f.type); }
        if (f.city) { sql += " AND city=?"; params.push(f.city); }
        if (f.minPrice) { sql += " AND price>=?"; params.push(f.minPrice); }
        if (f.maxPrice) { sql += " AND price<=?"; params.push(f.maxPrice); }
        return await this.attachImages(await executeQuery(sql, params));
    }

    async getFeaturedProperties() { return await this.attachImages(await executeQuery("SELECT * FROM properties WHERE featured=1 AND property_status='Approved'")); }
    async getLatestProperties() { return await this.attachImages(await executeQuery("SELECT * FROM properties WHERE property_status='Approved' ORDER BY created_at DESC LIMIT 10")); }

    async getDashboardStats(userId) {
        const total = await executeQuery("SELECT COUNT(*) as count FROM properties WHERE user_id=?", [userId]);
        const approved = await executeQuery("SELECT COUNT(*) as count FROM properties WHERE user_id=? AND property_status='Approved'", [userId]);
        return { total: total[0].count, approved: approved[0].count };
    }

    async addWishlist(userId, propertyId) { return await executeQuery("INSERT IGNORE INTO user_wishlist (user_id, property_id) VALUES (?,?)", [userId, propertyId]); }
    async removeWishlist(userId, propertyId) { return await executeQuery("DELETE FROM user_wishlist WHERE user_id=? AND property_id=?", [userId, propertyId]); }
    async getWishlist(userId) { return await this.attachImages(await executeQuery("SELECT p.* FROM properties p JOIN user_wishlist w ON p.id = w.property_id WHERE w.user_id=?", [userId])); }

    async addInterest(userId, propertyId, message) {
        const result = await executeQuery("INSERT INTO property_inquiries (user_id, property_id, message) VALUES (?,?,?)", [userId, propertyId, message]);

        // Notify property owner
        try {
            const property = await this.getPropertyById(propertyId);
            if (property && property.user_id) {
                const notificationService = require("./notification.service");
                const buyer = await executeQuery("SELECT full_name FROM users WHERE id=?", [userId]);
                const buyerName = buyer[0] ? buyer[0].full_name : "A buyer";
                await notificationService.create(
                    property.user_id,
                    "INTEREST",
                    "New Interest in Your Property",
                    `${buyerName} is interested in "${property.property_title}"`,
                    "property",
                    propertyId
                );
            }
        } catch (e) { /* silent */ }

        // Log activity
        try {
            const activityService = require("./activity.service");
            await activityService.logActivity(userId, "PROPERTY_INTEREST", "property", propertyId, `Buyer showed interest in property`, null);
        } catch (e) { /* silent */ }

        return result;
    }
    async getInterestsForUser(userId) {
        const rows = await executeQuery(
            `SELECT i.id, i.user_id AS sender_id, i.property_id, i.message, i.status, i.created_at,
                    p.property_title, p.price, p.property_for, p.property_type, p.city, p.address, p.state,
                    p.user_id AS owner_id,
                    CASE WHEN i.user_id = ? THEN 'sent' ELSE 'received' END AS direction,
                    s.full_name AS sender_name, s.mobile AS sender_mobile, s.email AS sender_email,
                    o.full_name AS owner_name, o.mobile AS owner_mobile, o.email AS owner_email
             FROM property_inquiries i
             JOIN properties p ON p.id = i.property_id
             LEFT JOIN users s ON s.id = i.user_id
             LEFT JOIN users o ON o.id = p.user_id
             WHERE i.user_id = ? OR p.user_id = ?
             ORDER BY i.created_at DESC`,
            [userId, userId, userId]
        );
        if (rows.length === 0) return [];
        const ids = [...new Set(rows.map((r) => r.property_id).filter((id) => id != null))];
        const imgRows = ids.length
            ? await executeQuery(
                `SELECT property_id, image FROM property_images WHERE property_id IN (${ids.map(() => "?").join(",")}) ORDER BY id ASC`,
                ids
            )
            : [];
        const map = new Map();
        for (const r of imgRows) {
            if (!map.has(r.property_id)) map.set(r.property_id, []);
            map.get(r.property_id).push(`/uploads/property/images/${r.image}`);
        }
        return rows.map((r) => ({ ...r, images: map.get(r.property_id) || [] }));
    }

    async removeInquiry(inquiryId, userId) {
        const rows = await executeQuery(
            `SELECT i.id, i.user_id AS sender_id, p.user_id AS owner_id
             FROM property_inquiries i JOIN properties p ON p.id = i.property_id WHERE i.id = ?`,
            [inquiryId]
        );
        if (!rows.length) throw new Error("Inquiry not found");
        if (Number(rows[0].sender_id) !== Number(userId) && Number(rows[0].owner_id) !== Number(userId)) throw new Error("You cannot remove this inquiry");
        await executeQuery("DELETE FROM property_inquiries WHERE id = ?", [inquiryId]);
        return { id: Number(inquiryId) };
    }

    async updateInquiryStatus(inquiryId, userId, status) {
        const allowed = ["New", "Contacted", "Converted", "Lost"];
        if (!allowed.includes(status)) throw new Error("Invalid status value");
        const rows = await executeQuery(
            `SELECT i.id, p.user_id AS owner_id FROM property_inquiries i JOIN properties p ON p.id = i.property_id WHERE i.id = ?`,
            [inquiryId]
        );
        if (!rows.length) throw new Error("Inquiry not found");
        if (Number(rows[0].owner_id) !== Number(userId)) throw new Error("Only the property owner can update inquiry status");
        await executeQuery("UPDATE property_inquiries SET status = ? WHERE id = ?", [status, inquiryId]);
        return { id: Number(inquiryId), status };
    }

    async updateVerificationStatus(propertyId, status, comment, user) {
        let verificationRows = await executeQuery(
            "SELECT * FROM property_verification WHERE property_id = ?",
            [propertyId]
        );

        if (verificationRows.length === 0) {
            await executeQuery(
                "INSERT INTO property_verification (property_id) VALUES (?)",
                [propertyId]
            );
            verificationRows = await executeQuery(
                "SELECT * FROM property_verification WHERE property_id = ?",
                [propertyId]
            );
        }

        const currentV = verificationRows[0];
        let adminAStatus = currentV.admin_a_status;
        let adminBStatus = currentV.admin_b_status;
        let superAdminStatus = currentV.super_admin_status;
        let adminAComment = currentV.admin_a_comment;
        let adminBComment = currentV.admin_b_comment;
        let superAdminComment = currentV.super_admin_comment;
        let adminAReviewedBy = currentV.admin_a_reviewed_by;
        let adminAReviewedAt = currentV.admin_a_reviewed_at;
        let adminBReviewedBy = currentV.admin_b_reviewed_by;
        let adminBReviewedAt = currentV.admin_b_reviewed_at;
        let superAdminReviewedBy = currentV.super_admin_reviewed_by;
        let superAdminReviewedAt = currentV.super_admin_reviewed_at;

        const roleId = Number(user.role_id);
        const now = new Date();

        if (roleId === 2) {
            adminAStatus = status;
            adminAComment = comment;
            adminAReviewedBy = user.id;
            adminAReviewedAt = now;
        } else if (roleId === 3) {
            adminBStatus = status;
            adminBComment = comment;
            adminBReviewedBy = user.id;
            adminBReviewedAt = now;
        } else if (roleId === 1) {
            superAdminStatus = status;
            superAdminComment = comment;
            superAdminReviewedBy = user.id;
            superAdminReviewedAt = now;
        }

        let globalPropertyStatus = 'Pending';

        if (adminAStatus === 'Approved' && adminBStatus === 'Approved') {
            globalPropertyStatus = 'Approved';
        } else if (adminAStatus === 'Rejected' && adminBStatus === 'Rejected') {
            globalPropertyStatus = 'Rejected';
        } else if (
            (adminAStatus === 'Approved' && adminBStatus === 'Rejected') ||
            (adminAStatus === 'Rejected' && adminBStatus === 'Approved')
        ) {
            if (superAdminStatus === 'Approved') {
                globalPropertyStatus = 'Approved';
            } else if (superAdminStatus === 'Rejected') {
                globalPropertyStatus = 'Rejected';
            } else {
                globalPropertyStatus = 'Pending';
            }
        } else if (roleId === 1) {
            globalPropertyStatus = status;
        } else {
            globalPropertyStatus = 'Pending';
        }

        await executeQuery(
            `UPDATE property_verification 
         SET admin_a_status = ?, admin_a_comment = ?, admin_a_reviewed_by = ?, admin_a_reviewed_at = ?,
             admin_b_status = ?, admin_b_comment = ?, admin_b_reviewed_by = ?, admin_b_reviewed_at = ?,
             super_admin_status = ?, super_admin_comment = ?, super_admin_reviewed_by = ?, super_admin_reviewed_at = ?
         WHERE property_id = ?`,
            [adminAStatus, adminAComment, adminAReviewedBy, adminAReviewedAt, adminBStatus, adminBComment, adminBReviewedBy, adminBReviewedAt, superAdminStatus, superAdminComment, superAdminReviewedBy, superAdminReviewedAt, propertyId]
        );

        await executeQuery(
            "UPDATE properties SET property_status = ? WHERE id = ?",
            [globalPropertyStatus, propertyId]
        );

        // Log activity
        try {
            const activityService = require("./activity.service");
            await activityService.logActivity(
                user.id,
                `PROPERTY_${status.toUpperCase()}`,
                "property",
                propertyId,
                `Property ${status} by ${user.email || 'Admin'}`,
                null
            );
        } catch (e) { /* silent */ }

        return {
            property_status: globalPropertyStatus,
            verification: {
                admin_a_status: adminAStatus,
                admin_b_status: adminBStatus,
                super_admin_status: superAdminStatus
            }
        };
    }

    async changeStatus(id, status) { return await executeQuery("UPDATE properties SET property_status=? WHERE id=?", [status, id]); }
    async setFeatured(id, featured) { return await executeQuery("UPDATE properties SET featured=? WHERE id=?", [featured, id]); }
    async getPropertyList() { return await this.attachImages(await executeQuery("SELECT * FROM properties WHERE property_status = 'Approved' ORDER BY created_at DESC")); }
    async getPopularProperties() { return await this.attachImages(await executeQuery("SELECT * FROM properties WHERE property_status = 'Approved' ORDER BY view_count DESC, created_at DESC LIMIT 12")); }
    async incrementViews(id) { return await executeQuery("UPDATE properties SET view_count = view_count + 1 WHERE id = ?", [id]); }

    // Public browse feed — filters + sorting + pagination.
    // Returns top-level { listings, total, page, totalPages, limit }
    // (matches the payload shape the website PropertyList page reads).
    async browseProperties(q = {}) {
        const toArray = (v) => {
            if (v == null || v === "") return [];
            return (Array.isArray(v) ? v : String(v).split(","))
                .map((s) => String(s).trim())
                .filter(Boolean);
        };
        const toNum = (v) => {
            if (v == null || v === "") return null;
            const n = Number(v);
            return Number.isFinite(n) ? n : null;
        };

        let rows = await this.attachImages(
            await executeQuery("SELECT * FROM properties WHERE property_status='Approved'")
        );

        // category_id → category_name map (hero/sidebar send category names as propertyTypes)
        let categoryNameById = {};
        try {
            const cats = await executeQuery(
                "SELECT id, category_name FROM property_categories"
            );
            for (const c of cats) {
                categoryNameById[Number(c.id)] = String(c.category_name || "");
            }
        } catch {
            categoryNameById = {};
        }

        // --- keyword (tokenized across title, description, location, type, category) ---
        const keyword = String(q.keyword || q.search || "").trim().toLowerCase();
        if (keyword) {
            const tokens = keyword.split(/\s+/).filter(Boolean);
            const haystack = (p) =>
                [
                    p.property_title,
                    p.description,
                    p.address,
                    p.city,
                    p.state,
                    p.pincode,
                    p.property_type,
                    p.property_for,
                    p.furnishing,
                    p.construction_status,
                    categoryNameById[Number(p.category_id)] || "",
                ]
                    .map((v) => String(v || "").toLowerCase())
                    .join(" ");
            // Every token must appear somewhere (phrase + multi-word friendly)
            rows = rows.filter((p) => {
                const text = haystack(p);
                return tokens.every((t) => text.includes(t));
            });
        }
        const location = String(q.location || q.city || "").trim().toLowerCase();
        if (location) {
            rows = rows.filter(
                (p) =>
                    String(p.address || "").toLowerCase().includes(location) ||
                    String(p.city || "").toLowerCase().includes(location) ||
                    String(p.state || "").toLowerCase().includes(location)
            );
        }

        // --- purpose (Sale / Rent) ---
        const purpose = String(q.listingType || q.purpose || "").trim();
        if (purpose) {
            rows = rows.filter((p) => {
                const pf = String(p.property_for || "");
                return pf === purpose || pf === "Sale/Rent" || pf.includes(purpose);
            });
        }

        // --- property types (category names like "Villa" OR raw property_type) ---
        const types = toArray(q.propertyTypes);
        if (types.length) {
            const typeIds = new Set();
            const typeNames = new Set();
            for (const t of types) {
                const tl = t.toLowerCase();
                typeNames.add(tl);
                for (const [id, name] of Object.entries(categoryNameById)) {
                    if (String(name).toLowerCase() === tl) typeIds.add(Number(id));
                }
            }
            rows = rows.filter((p) => {
                const catName = (categoryNameById[Number(p.category_id)] || "").toLowerCase();
                const pType = String(p.property_type || "").toLowerCase();
                return (
                    typeIds.has(Number(p.category_id)) ||
                    typeNames.has(catName) ||
                    typeNames.has(pType)
                );
            });
        } else if (q.type) {
            const tl = String(q.type).toLowerCase();
            const typeId = Object.entries(categoryNameById).find(
                ([, name]) => String(name).toLowerCase() === tl
            );
            rows = rows.filter((p) => {
                const catName = (categoryNameById[Number(p.category_id)] || "").toLowerCase();
                return (
                    String(p.property_type || "").toLowerCase() === tl ||
                    catName === tl ||
                    (typeId && Number(p.category_id) === Number(typeId[0]))
                );
            });
        }

        // --- bedrooms (["1","2","3","4+"] — 4+ means >= 4) ---
        const beds = toArray(q.bedrooms);
        if (beds.length) {
            rows = rows.filter((p) => {
                const b = Number(p.bedroom) || 0;
                return beds.some((opt) =>
                    opt.endsWith("+") ? b >= Number(opt.slice(0, -1)) : b === Number(opt)
                );
            });
        }

        // --- numeric ranges ---
        const minPrice = toNum(q.minPrice);
        const maxPrice = toNum(q.maxPrice);
        const minArea = toNum(q.minArea);
        const maxArea = toNum(q.maxArea);
        if (minPrice != null) rows = rows.filter((p) => Number(p.price) >= minPrice);
        if (maxPrice != null) rows = rows.filter((p) => Number(p.price) <= maxPrice);
        if (minArea != null) rows = rows.filter((p) => Number(p.area) >= minArea);
        if (maxArea != null) rows = rows.filter((p) => Number(p.area) <= maxArea);

        // --- listing status (e.g. New Launch) ---
        if (q.status) {
            rows = rows.filter(
                (p) =>
                    String(p.construction_status || "") === String(q.status) ||
                    String(p.property_status || "") === String(q.status)
            );
        }

        // --- sorting ---
        const sort = String(q.sort || "relevance");
        switch (sort) {
            case "price_low":
                rows = rows.slice().sort((a, b) => ((Number(a.price) || 0) - (Number(b.price) || 0)) * 1);
                break;
            case "price_high":
                rows = rows.slice().sort((a, b) => ((Number(a.price) || 0) - (Number(b.price) || 0)) * -1);
                break;
            case "area_high":
                rows = rows.slice().sort((a, b) => ((Number(a.area) || 0) - (Number(b.area) || 0)) * -1);
                break;
            case "newest":
                rows = rows.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
            default:
                // relevance — featured first, then newest
                rows = rows.slice().sort((a, b) => {
                    const f = (Number(b.featured) || 0) - (Number(a.featured) || 0);
                    if (f !== 0) return f;
                    return new Date(b.created_at) - new Date(a.created_at);
                });
        }

        // --- pagination ---
        const limit = Math.min(Math.max(toNum(q.limit) || 9, 1), 50);
        const totalPages = Math.max(Math.ceil(rows.length / limit), 1);
        const page = Math.min(Math.max(toNum(q.page) || 1, 1), totalPages);
        const start = (page - 1) * limit;

        return {
            listings: rows.slice(start, start + limit),
            total: rows.length,
            page,
            totalPages,
            limit,
        };
    }
}

module.exports = new PropertyService();
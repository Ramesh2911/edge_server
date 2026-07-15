const propertyService = require("../services/property.service");
const response = require("../helpers/response");

class PropertyController {
    // Basic Lookups
    async getAmenities(req, res) {
        try {
            const data = await propertyService.getAllAmenities();
            return response.success(res, "Amenities loaded", data);
        } catch (err) { return response.error(res, err.message, 500); }
    }

    async getCategories(req, res) {
        try {
            const data = await propertyService.getAllCategories();
            return response.success(res, "Categories loaded", data);
        } catch (err) { return response.error(res, err.message, 500); }
    }

    // CRUD Handlers
    async createProperty(req, res) {
        if (!req.user) return response.error(res, "Unauthorized", 401);
        try {
            const propertyId = await propertyService.createProperty(req.body, req.user.id, req.files);
            return response.success(res, "Property created successfully", { propertyId }, 201);
        } catch (err) { return response.error(res, err.message, 500); }
    }

    async updateProperty(req, res) {
        if (!req.user) return response.error(res, "Unauthorized", 401);
        try {
            await propertyService.updateProperty(req.params.id, req.body, req.user.id, req.files);
            return response.success(res, "Property updated successfully");
        } catch (err) { return response.error(res, err.message, 500); }
    }

    async deleteProperty(req, res) {
        if (!req.user) return response.error(res, "Unauthorized", 401);
        try {
            await propertyService.deleteProperty(req.params.id, req.user.id);
            return response.success(res, "Property deleted successfully");
        } catch (err) { return response.error(res, err.message, 500); }
    }

    async getProperties(req, res) {
        try {
            const data = await propertyService.getProperties(req.query);
            return response.success(res, "Properties fetched", data);
        } catch (err) { return response.error(res, err.message, 500); }
    }

    async getPropertyById(req, res) {
        try {
            const data = await propertyService.getPropertyById(req.params.id);
            if (!data) return response.error(res, "Not Found", 404);
            return response.success(res, "Property details fetched", data);
        } catch (err) { return response.error(res, err.message, 500); }
    }

    async getMyProperties(req, res) {
        if (!req.user) return response.error(res, "Unauthorized", 401);
        try {
            const data = await propertyService.getMyProperties(req.user.id);
            return response.success(res, "User properties fetched", data);
        } catch (err) { return response.error(res, err.message, 500); }
    }

    // Queries & Discoveries
    async searchProperty(req, res) {
        try {
            const data = await propertyService.searchProperty(req.query.keyword);
            return response.success(res, "Search complete", data);
        } catch (err) { return response.error(res, err.message, 500); }
    }

    async filterProperty(req, res) {
        try {
            const data = await propertyService.filterProperty(req.query);
            return response.success(res, "Filters applied", data);
        } catch (err) { return response.error(res, err.message, 500); }
    }

    async getFeaturedProperties(req, res) {
        try {
            const data = await propertyService.getFeaturedProperties();
            return response.success(res, "Featured properties loaded", data);
        } catch (err) { return response.error(res, err.message, 500); }
    }

    async getLatestProperties(req, res) {
        try {
            const data = await propertyService.getLatestProperties();
            return response.success(res, "Latest properties loaded", data);
        } catch (err) { return response.error(res, err.message, 500); }
    }

    async dashboardStats(req, res) {
        if (!req.user) return response.error(res, "Unauthorized", 401);
        try {
            const data = await propertyService.getDashboardStats(req.user.id);
            return response.success(res, "Dashboard telemetry gathered", data);
        } catch (err) { return response.error(res, err.message, 500); }
    }

    // Wishlist Methods
    async addWishlist(req, res) {
        if (!req.user) return response.error(res, "Unauthorized", 401);
        try {
            await propertyService.addWishlist(req.user.id, req.body.propertyId);
            return response.success(res, "Added to wishlist");
        } catch (err) { return response.error(res, err.message, 500); }
    }

    async removeWishlist(req, res) {
        if (!req.user) return response.error(res, "Unauthorized", 401);
        try {
            await propertyService.removeWishlist(req.user.id, req.params.propertyId);
            return response.success(res, "Removed from wishlist");
        } catch (err) { return response.error(res, err.message, 500); }
    }

    async getWishlist(req, res) {
        if (!req.user) return response.error(res, "Unauthorized", 401);
        try {
            const data = await propertyService.getWishlist(req.user.id);
            return response.success(res, "Wishlist loaded", data);
        } catch (err) { return response.error(res, err.message, 500); }
    }

    // Customer Inquiries
    async interestedProperty(req, res) {
        if (!req.user) return response.error(res, "Unauthorized", 401);
        try {
            await propertyService.addInterest(req.user.id, req.params.propertyId, req.body.message);
            return response.success(res, "Interest logged successfully");
        } catch (err) { return response.error(res, err.message, 500); }
    }

    async getInterestedProperty(req, res) {
        if (!req.user) return response.error(res, "Unauthorized", 401);
        try {
            const data = await propertyService.getInterestsForUser(req.user.id);
            return response.success(res, "Leads tracking array loaded", data);
        } catch (err) { return response.error(res, err.message, 500); }
    }

    // Administration Actions
    async approveProperty(req, res) {
        try {
            await propertyService.updateVerificationStatus(req.params.id, 'Approved', req.body.comments);
            return response.success(res, "Property validation approved");
        } catch (err) { return response.error(res, err.message, 500); }
    }

    async rejectProperty(req, res) {
        try {
            await propertyService.updateVerificationStatus(req.params.id, 'Rejected', req.body.comments);
            return response.success(res, "Property listing rejected");
        } catch (err) { return response.error(res, err.message, 500); }
    }

    async changeStatus(req, res) {
        try {
            await propertyService.changeStatus(req.params.id, req.body.status);
            return response.success(res, "Status column adjusted");
        } catch (err) { return response.error(res, err.message, 500); }
    }

    async makeFeatured(req, res) {
        try {
            await propertyService.setFeatured(req.params.id, req.body.featured);
            return response.success(res, "Featured configuration saved");
        } catch (err) { return response.error(res, err.message, 500); }
    }

    async adminPropertyList(req, res) {
        try {
            const data = await propertyService.getAdminPropertyList(req.query);
            return response.success(res, "Administrative full grid mapped", data);
        } catch (err) { return response.error(res, err.message, 500); }
    }
}

module.exports = new PropertyController();
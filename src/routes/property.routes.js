const express = require("express");
const router = express.Router();
const propertyController = require("../controllers/property.controller");
const { propertyUpload } = require("../middleware/upload.middleware");
const verifyToken = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const { ROLE } = require("../config/constants");

// Public Lookups & Feeds
router.get("/", propertyController.browseProperties);
router.get("/amenities", propertyController.getAmenities);
router.get("/categories", propertyController.getCategories);
router.get("/featured", propertyController.getFeaturedProperties);
router.get("/latest", propertyController.getLatestProperties);
router.get("/search", propertyController.searchProperty);
router.get("/filter", propertyController.filterProperty);
router.get("/all", verifyToken, roleMiddleware(ROLE.SUPER_ADMIN, ROLE.ADMIN_A, ROLE.ADMIN_B), propertyController.getProperties);
router.get("/details/:id", propertyController.getPropertyById);
router.get("/list", propertyController.propertyList);

// Protected Core Actions & User Dashboards
router.post("/create", verifyToken, propertyUpload, propertyController.createProperty);
router.put("/update/:id", verifyToken, propertyUpload, propertyController.updateProperty);
router.delete("/delete/:id", verifyToken, propertyController.deleteProperty);
router.get("/my-properties", verifyToken, propertyController.getMyProperties);
router.get("/dashboard/stats", verifyToken, propertyController.dashboardStats);

// Wishlist Controls
router.post("/wishlist/add", verifyToken, propertyController.addWishlist);
router.delete("/wishlist/remove/:propertyId", verifyToken, propertyController.removeWishlist);
router.get("/wishlist", verifyToken, propertyController.getWishlist);

// Lead / Inquiries Tracking
router.post("/interested/:propertyId", verifyToken, propertyController.interestedProperty);
router.get("/leads/interested", verifyToken, propertyController.getInterestedProperty);

// Administrative Controls (Admin A, Admin B, Super Admin only)
router.patch("/admin/approve/:id", verifyToken, roleMiddleware(ROLE.SUPER_ADMIN, ROLE.ADMIN_A, ROLE.ADMIN_B), propertyController.approveProperty);
router.patch("/admin/reject/:id", verifyToken, roleMiddleware(ROLE.SUPER_ADMIN, ROLE.ADMIN_A, ROLE.ADMIN_B), propertyController.rejectProperty);
router.patch("/admin/status/:id", verifyToken, roleMiddleware(ROLE.SUPER_ADMIN), propertyController.changeStatus);
router.patch("/admin/featured/:id", verifyToken, roleMiddleware(ROLE.SUPER_ADMIN), propertyController.makeFeatured);

module.exports = router;
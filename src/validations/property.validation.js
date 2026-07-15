const { body } = require("express-validator");

const propertyValidationRules = () => {
    return [
        body("category_id").isInt().withMessage("Valid category ID is required"),
        body("property_title").notEmpty().withMessage("Property title is required").isLength({ max: 255 }),
        body("property_for").isIn(["Sale", "Rent"]).withMessage("Property for must be either 'Sale' or 'Rent'"),
        body("property_type").isIn(["Residential", "Commercial"]).withMessage("Property type must be 'Residential' or 'Commercial'"),
        body("price").isDecimal().withMessage("Valid price decimal value is required"),
        body("area").isDecimal().withMessage("Valid area decimal value is required"),
        body("area_unit").notEmpty().withMessage("Area unit is required"),
        body("bedroom").optional().isInt({ min: 0 }),
        body("bathroom").optional().isInt({ min: 0 }),
        body("balcony").optional().isInt({ min: 0 }),
        body("parking").optional().isInt({ min: 0 }),
        body("furnishing").optional().isString(),
        body("ownership").optional().isString(),
        body("construction_status").optional().isString(),
        body("possession_date").optional().isISO8601().withMessage("Valid possession date is required"),
        body("description").optional().isString(),
        body("address").notEmpty().withMessage("Address is required"),
        body("city").notEmpty().withMessage("City is required"),
        body("state").notEmpty().withMessage("State is required"),
        body("country").notEmpty().withMessage("Country is required"),
        body("pincode").notEmpty().withMessage("Pincode is required"),
        body("latitude").optional().isString(),
        body("longitude").optional().isString(),
        // Expecting amenities as an array of IDs or a JSON-stringified array
        body("amenities").optional().custom((value) => {
            if (value) {
                const parsed = typeof value === 'string' ? JSON.parse(value) : value;
                if (!Array.isArray(parsed)) throw new Error("Amenities must be an array");
            }
            return true;
        })
    ];
};

module.exports = {
    propertyValidationRules
};
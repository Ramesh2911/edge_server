const userService = require("../services/user.service");

// Role ID Mappings
const ROLE_IDS = {
    OWNER: 4,
    BROKER: 5,
    DEVELOPER: 6,
    BUYER: 7
};

// GET /owners
const getOwners = async (req, res) => {
    try {
        const data = await userService.getUsersByRoleId(ROLE_IDS.OWNER);
        return res.status(200).json({
            success: true,
            message: "Owners fetched successfully",
            data
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch owners"
        });
    }
};

// GET /buyers
const getBuyers = async (req, res) => {
    try {
        const data = await userService.getUsersByRoleId(ROLE_IDS.BUYER);
        return res.status(200).json({
            success: true,
            message: "Buyers fetched successfully",
            data
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch buyers"
        });
    }
};

// GET /developers
const getDevelopers = async (req, res) => {
    try {
        const data = await userService.getUsersByRoleId(ROLE_IDS.DEVELOPER);
        return res.status(200).json({
            success: true,
            message: "Developers fetched successfully",
            data
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch developers"
        });
    }
};

// GET /brokers
const getBrokers = async (req, res) => {
    try {
        const data = await userService.getUsersByRoleId(ROLE_IDS.BROKER);
        return res.status(200).json({
            success: true,
            message: "Brokers fetched successfully",
            data
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch brokers"
        });
    }
};

module.exports = {
    getOwners,
    getBuyers,
    getDevelopers,
    getBrokers
};
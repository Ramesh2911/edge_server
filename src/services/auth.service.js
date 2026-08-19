const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwtHelper = require("../helpers/jwt");
const response = require("../helpers/response");
const uploadHelper = require("../helpers/upload");
const fileDelete = require("../helpers/fileDelete");

class AuthService {

    // Register
    async register(body) {

        try {

            const {

                role_id,

                full_name,

                email,

                mobile,

                password,

                company_name,

                rera_number,

                address,

                city,

                state,

                country,

                pincode

            } = body;

            // ===============================
            // Check Email
            // ===============================

            const [emailExists] = await db.query(

                `SELECT id
                 FROM users
                 WHERE email = ?`,

                [email]

            );

            if (emailExists.length > 0) {

                return {

                    success: false,

                    status: 409,

                    message: "Email already exists."

                };

            }

            // ===============================
            // Check Mobile
            // ===============================

            const [mobileExists] = await db.query(

                `SELECT id
                 FROM users
                 WHERE mobile = ?`,

                [mobile]

            );

            if (mobileExists.length > 0) {

                return {

                    success: false,

                    status: 409,

                    message: "Mobile number already exists."

                };

            }

            // ===============================
            // Encrypt Password
            // ===============================

            const hashedPassword = await bcrypt.hash(

                password,

                10

            );

            // ===============================
            // Insert User
            // ===============================

            const [result] = await db.query(

                `INSERT INTO users (

                    role_id,

                    full_name,

                    email,

                    mobile,

                    password,

                    company_name,

                    rera_number,

                    address,

                    city,

                    state,

                    country,

                    pincode,

                    status,

                    is_verified

                )

                VALUES (

                    ?,?,?,?,?,?,?,?,?,?,?,?,1,1

                )`,

                [

                    role_id,

                    full_name,

                    email,

                    mobile,

                    hashedPassword,

                    company_name || null,

                    rera_number || null,

                    address || null,

                    city || null,

                    state || null,

                    country || null,

                    pincode || null

                ]

            );

            // ===============================
            // Get Created User
            // ===============================

            const [user] = await db.query(

                `SELECT

                    id,

                    role_id,

                    full_name,

                    email,

                    mobile,

                    company_name,

                    rera_number,

                    profile_image,

                    status,

                    is_verified

                FROM users

                WHERE id=?`,

                [

                    result.insertId

                ]

            );

            // ===============================
            // JWT Token
            // ===============================

            const token = jwtHelper.generateToken(

                user[0]

            );

            return {

                success: true,

                status: 201,

                message: "Registration Successful.",

                data: {

                    token,

                    user: user[0]

                }

            };

        }

        catch (error) {

            throw error;

        }

    }

    // Login
    async login(body) {
        try {
            const { email, mobile, password } = body;

            // 1. Safeguard against empty payloads
            if (!email && !mobile) {
                return {
                    success: false,
                    status: 400,
                    message: "Please provide an email or mobile number."
                };
            }

            // 2. Query dynamically handling fallback variables securely
            const [users] = await db.query(
                `SELECT
        u.id,
        u.role_id,
        r.role_name,
        u.full_name,
        u.email,
        u.mobile,
        u.password,
        u.profile_image,
        u.company_name,
        u.rera_number,
        u.status,
        u.is_verified
    FROM users u
    INNER JOIN roles r
        ON u.role_id = r.id
    WHERE
        (? IS NOT NULL AND u.email = ?)
        OR
        (? IS NOT NULL AND u.mobile = ?)
    LIMIT 1`,
                [email || null, email || null, mobile || null, mobile || null]
            );

            // 3. FIX: Uncomment and safely handle if database lookup fails
            if (!users || users.length === 0) {
                return {
                    success: false,
                    status: 401,
                    message: "Invalid Email/Mobile or Password."
                };
            }

            const user = users[0];

            // =============================
            // Account Status & Verification
            // =============================
            if (user.status !== 1) {
                return {
                    success: false,
                    status: 403,
                    message: "Your account has been deactivated."
                };
            }

            if (user.is_verified !== 1) {
                return {
                    success: false,
                    status: 403,
                    message: "Your account is not verified."
                };
            }

            // =============================
            // Password Match
            // =============================
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return {
                    success: false,
                    status: 401,
                    message: "Invalid Email/Mobile or Password."
                };
            }

            // =============================
            // Update Last Login
            // =============================
            await db.query(
                `UPDATE users SET last_login = NOW() WHERE id = ?`,
                [user.id]
            );

            // Log login activity
            try {
                const activityService = require("./activity.service");
                await activityService.logActivity(user.id, "LOGIN", "user", user.id, `User ${user.email} logged in`, null);
            } catch (e) { /* silent */ }

            // =============================
            // Generate JWT Token
            // =============================
            const token = jwtHelper.generateToken({
                id: user.id,
                role_id: user.role_id,
                email: user.email
            });

            delete user.password;

            return {
                success: true,
                status: 200,
                message: "Login Successfully.",
                data: { token, user }
            };

        } catch (error) {
            throw error;
        }
    }

    // user profile
    async getProfile(userId) {

        try {

            const [users] = await db.query(

                `SELECT

                u.id,

                u.role_id,

                r.role_name,

                u.full_name,

                u.email,

                u.mobile,

                u.company_name,

                u.rera_number,

                u.profile_image,

                u.address,

                u.city,

                u.state,

                u.country,

                u.pincode,

                u.status,

                u.is_verified,

                u.last_login,

                u.created_at

            FROM users u

            INNER JOIN roles r
            ON r.id = u.role_id

            WHERE u.id = ?

            LIMIT 1`,

                [userId]

            );

            if (users.length === 0) {

                return {

                    success: false,

                    status: 404,

                    message: "User not found."

                };

            }

            const user = users[0];

            // Profile Image URL

            if (user.profile_image) {

                user.profile_image =
                    `${process.env.BASE_URL}/uploads/profile/${user.profile_image}`;

            }

            return {

                success: true,

                status: 200,

                message: "Profile fetched successfully.",

                data: user

            };

        }

        catch (error) {

            throw error;

        }

    }

    // Update Profile
    async updateProfile(userId, body, file) {

        try {

            // =============================
            // Check User
            // =============================

            const [users] = await db.query(

                `SELECT id, profile_image
             FROM users
             WHERE id = ?`,

                [userId]

            );

            if (users.length === 0) {

                return {

                    success: false,

                    status: 404,

                    message: "User not found."

                };

            }

            const oldUser = users[0];

            // =============================
            // Profile Image
            // =============================

            let profileImage = oldUser.profile_image;

            if (file) {

                // Delete Old Image

                if (oldUser.profile_image) {

                    fileDelete.deleteFile(

                        `uploads/profile/${oldUser.profile_image}`

                    );

                }

                profileImage = file.filename;

            }

            // =============================
            // Update
            // =============================

            await db.query(

                `UPDATE users

            SET

                full_name=?,

                mobile=?,

                company_name=?,

                rera_number=?,

                address=?,

                city=?,

                state=?,

                country=?,

                pincode=?,

                profile_image=?

            WHERE id=?`,

                [

                    body.full_name,

                    body.mobile,

                    body.company_name || null,

                    body.rera_number || null,

                    body.address || null,

                    body.city || null,

                    body.state || null,

                    body.country || null,

                    body.pincode || null,

                    profileImage,

                    userId

                ]

            );

            // =============================
            // Fetch Updated User
            // =============================

            const [updatedUser] = await db.query(

                `SELECT

                u.id,

                u.role_id,

                r.role_name,

                u.full_name,

                u.email,

                u.mobile,

                u.company_name,

                u.rera_number,

                u.profile_image,

                u.address,

                u.city,

                u.state,

                u.country,

                u.pincode

            FROM users u

            INNER JOIN roles r

            ON r.id=u.role_id

            WHERE u.id=?`,

                [userId]

            );

            const user = updatedUser[0];

            user.profile_image = uploadHelper.profileImage(

                user.profile_image

            );

            return {

                success: true,

                status: 200,

                message: "Profile updated successfully.",

                data: user

            };

        }

        catch (error) {

            throw error;

        }

    }


    // Change Password
    async changePassword(userId, body) {

        try {

            const {

                old_password,

                new_password

            } = body;

            // ======================================
            // Check User
            // ======================================

            const [users] = await db.query(

                `SELECT
                id,
                password
            FROM users
            WHERE id = ?`,

                [userId]

            );

            if (users.length === 0) {

                return {

                    success: false,

                    status: 404,

                    message: "User not found."

                };

            }

            const user = users[0];

            // ======================================
            // Verify Old Password
            // ======================================

            const isMatch = await bcrypt.compare(

                old_password,

                user.password

            );

            if (!isMatch) {

                return {

                    success: false,

                    status: 400,

                    message: "Old password is incorrect."

                };

            }

            // ======================================
            // Prevent Same Password
            // ======================================

            const samePassword = await bcrypt.compare(

                new_password,

                user.password

            );

            if (samePassword) {

                return {

                    success: false,

                    status: 400,

                    message: "New password cannot be the same as the old password."

                };

            }

            // ======================================
            // Encrypt Password
            // ======================================

            const hashPassword = await bcrypt.hash(

                new_password,

                10

            );

            // ======================================
            // Update Password
            // ======================================

            await db.query(

                `UPDATE users
             SET password = ?
             WHERE id = ?`,

                [

                    hashPassword,

                    userId

                ]

            );

            return {

                success: true,

                status: 200,

                message: "Password changed successfully."

            };

        }

        catch (error) {

            throw error;

        }

    }

    async logoutUser(token) {
        return true;
    }

}

module.exports = new AuthService();
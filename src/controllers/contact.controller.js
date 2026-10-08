const db = require("../config/db");
const response = require("../helpers/response");

class ContactController {
    // Public inquiry inbox — POST /api/v1/contact
    async createMessage(req, res) {
        try {
            const { name, email, phone, subject, message } = req.body || {};

            if (!name || !String(name).trim()) {
                return response.error(res, "Name is required", 400);
            }
            if (!message || String(message).trim().length < 10) {
                return response.error(res, "Message must be at least 10 characters", 400);
            }
            if (email && !/^\S+@\S+\.\S+$/.test(String(email))) {
                return response.error(res, "Please provide a valid email", 400);
            }

            await db.query(
                "INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?,?,?,?,?)",
                [
                    String(name).trim(),
                    email ? String(email).trim() : null,
                    phone ? String(phone).trim() : null,
                    subject ? String(subject).trim() : null,
                    String(message).trim(),
                ]
            );

            return response.success(
                res,
                "Inquiry submitted! An advisor will reach out shortly.",
                {},
                201
            );
        } catch (error) {
            console.error("contact.createMessage:", error);
            return response.error(res, "Could not submit inquiry");
        }
    }
}

module.exports = new ContactController();

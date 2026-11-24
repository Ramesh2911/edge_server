const transporter = require("../config/mail");

/**
 * Fire-and-forget mail helper. Never throws — mail config may be
 * missing in local dev, and listing flows must not fail on SMTP errors.
 */
const sendMail = async ({ to, subject, html, text }) => {
    if (!to || !process.env.MAIL_HOST) return false;
    try {
        await transporter.sendMail({
            from: process.env.MAIL_FROM || process.env.MAIL_USER || "Edge Realty <no-reply@edgemilerealty.tech>",
            to,
            subject,
            html,
            text,
        });
        return true;
    } catch (err) {
        console.error("sendMail failed:", err.message);
        return false;
    }
};

const wrapTemplate = (title, body) => `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#2A2419">
    <div style="background:#1E4C8C;color:#fff;padding:16px 24px;border-radius:8px 8px 0 0">
      <h2 style="margin:0;font-size:18px">Edge Realty</h2>
    </div>
    <div style="border:1px solid #E9E2D4;border-top:none;padding:24px;border-radius:0 0 8px 8px;background:#FBF7EF">
      <h3 style="margin:0 0 12px;color:#153964;font-size:16px">${title}</h3>
      <p style="line-height:1.6;font-size:14px;margin:0 0 8px">${body}</p>
      <p style="line-height:1.6;font-size:12px;color:#6F6655;margin-top:24px">
        This is an automated message from Edge Realty. Please do not reply to this email.
      </p>
    </div>
  </div>`;

module.exports = { sendMail, wrapTemplate };

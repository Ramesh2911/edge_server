-- =============================================
-- EDGE MILE REALTY - Database Migration
-- Run this SQL to create missing tables
-- =============================================

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50) DEFAULT NULL,
    target_id INT DEFAULT NULL,
    details TEXT DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- SEO Pages Table
CREATE TABLE IF NOT EXISTS seo_pages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    meta_title VARCHAR(255) DEFAULT NULL,
    meta_description TEXT DEFAULT NULL,
    content TEXT DEFAULT NULL,
    keywords TEXT DEFAULT NULL,
    status TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Buyer Requirements Table (Lead Generation Pop-up)
CREATE TABLE IF NOT EXISTS buyer_requirements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) DEFAULT NULL,
    title VARCHAR(255) DEFAULT NULL,
    purpose ENUM('Buy', 'Rent') DEFAULT 'Buy',
    property_type VARCHAR(100) DEFAULT NULL,
    min_budget DECIMAL(15,2) DEFAULT NULL,
    max_budget DECIMAL(15,2) DEFAULT NULL,
    city VARCHAR(100) DEFAULT NULL,
    beds INT DEFAULT NULL,
    baths INT DEFAULT NULL,
    min_area DECIMAL(10,2) DEFAULT NULL,
    max_area DECIMAL(10,2) DEFAULT NULL,
    amenities TEXT DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    status ENUM('New', 'Contacted', 'Converted', 'Lost') DEFAULT 'New',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT DEFAULT NULL,
    reference_type VARCHAR(50) DEFAULT NULL,
    reference_id INT DEFAULT NULL,
    is_read TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add reviewed_by and reviewed_at columns to property_verification
ALTER TABLE property_verification
    ADD COLUMN IF NOT EXISTS admin_a_reviewed_by INT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS admin_a_reviewed_at TIMESTAMP NULL DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS admin_b_reviewed_by INT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS admin_b_reviewed_at TIMESTAMP NULL DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS super_admin_reviewed_by INT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS super_admin_reviewed_at TIMESTAMP NULL DEFAULT NULL;

-- Insert default SEO pages
INSERT IGNORE INTO seo_pages (title, slug, meta_title, meta_description, content, keywords) VALUES
('Home', 'home', 'EDGE MILE REALTY - Premium Real Estate', 'Find your dream property with EDGE MILE REALTY. Buy, rent, and sell properties across India.', '<h1>Welcome to EDGE MILE REALTY</h1><p>Your trusted partner in real estate.</p>', 'real estate, property, buy, rent, India'),
('About Us', 'about', 'About EDGE MILE REALTY', 'Learn about EDGE MILE REALTY - your trusted real estate partner.', '<h1>About EDGE MILE REALTY</h1><p>We are a leading real estate platform.</p>', 'about, real estate, company'),
('Contact', 'contact', 'Contact EDGE MILE REALTY', 'Get in touch with EDGE MILE REALTY for all your real estate needs.', '<h1>Contact Us</h1><p>We are here to help you.</p>', 'contact, real estate, support');

-- Site Settings Table (key-value platform configuration)
CREATE TABLE IF NOT EXISTS site_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(64) NOT NULL UNIQUE,
    setting_value TEXT DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT IGNORE INTO site_settings (setting_key, setting_value) VALUES
('platform_name', 'EdgeMile Realty Platform Engine'),
('revenue_percent', '20'),
('token_hours', '24');

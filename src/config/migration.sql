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

-- User Wishlist (saved properties) Table
CREATE TABLE IF NOT EXISTS user_wishlist (
    user_id INT NOT NULL,
    property_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, property_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
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
('token_hours', '24'),
('footer_phone', '(+91) 8585033913'),
('footer_email', 'info@edgemilerealty.com'),
('footer_address', '59/1 Panchanan Tala Road, Howrah- 711101');

-- Footer Useful Links Table (admin-managed website footer)
CREATE TABLE IF NOT EXISTS footer_links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    label VARCHAR(150) NOT NULL UNIQUE,
    url VARCHAR(600) DEFAULT '#',
    sort_order INT DEFAULT 0,
    status TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT IGNORE INTO footer_links (label, url, sort_order) VALUES
('Cancellation & Refund Policy', '/cancellation-refund-policy', 1),
('User Conduct Policy', '/user-conduct-policy', 2),
('Listing Policy', '/listing-policy', 3),
('Advertisement Policy', '/advertisement-policy', 4),
('Anti Fraud Policy', '/anti-fraud-policy', 5),
('Grievance & Hierarchy', '/grievance-hierarchy', 6);

-- Footer menu page content (admin-written body text per menu item)
ALTER TABLE footer_links ADD COLUMN content MEDIUMTEXT NULL;

-- About page content (public keys, served by GET /api/v1/content)
INSERT IGNORE INTO site_settings (setting_key, setting_value) VALUES
('about_hero_title', 'Architecting Dreams into *Reality*'),
('about_hero_sub', 'We bridge the gap between extraordinary properties and discerning buyers across the globe — with data, discretion and decade-defying expertise.'),
('about_mission', 'To empower clients through transparent data, exceptional advisory services and a seamless digital platform that makes acquiring premier property simple and gratifying.'),
('about_vision', 'To set the global benchmark for integrity, luxury branding and prop-tech innovation in the real estate sector for generations to come.'),
('about_stats', '$2.4B+ | Volume Sold\n1200+ | Properties Managed\n99.2% | Client Satisfaction\n15+ | Years Experience'),
('about_cta_title', 'Ready to Find Your *Dream* Property?'),
('about_cta_sub', 'Get in touch with our advisors to explore exclusive listings tailored to your goals.');

-- Blog posts (admin-managed, shown in home page blog section)
CREATE TABLE IF NOT EXISTS blog_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    tag VARCHAR(100) DEFAULT '',
    post_date DATE NULL,
    excerpt TEXT,
    image_url VARCHAR(600) DEFAULT '',
    status TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT IGNORE INTO blog_posts (title, slug, tag, post_date, excerpt, image_url) VALUES
('10 Things You Must Know Before Buying a Home', '10-things-you-must-know-before-buying-a-home', 'Home Buying', '2026-06-12', 'From budgeting to legal checks, here is everything first-time buyers often overlook.', 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=480&h=320&q=80'),
('Real Estate Market Trends in 2026', 'real-estate-market-trends-in-2026', 'Market Trends', '2026-05-28', 'Key insights into pricing patterns and demand shifts across major Indian cities.', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=480&h=320&q=80'),
('7 Smart Decor Ideas to Elevate Your Space', '7-smart-decor-ideas-to-elevate-your-space', 'Home Decor', '2026-05-14', 'Simple and affordable ways to bring a fresh, premium feel to your home interiors.', 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=480&h=320&q=80'),
('Why Real Estate is the Best Long-Term Investment', 'why-real-estate-is-the-best-long-term-investment', 'Investment', '2026-04-30', 'Discover why steady appreciation makes property a smart addition to your portfolio.', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=480&h=320&q=80');

-- Contact page content (public keys, served by GET /api/v1/content)
INSERT IGNORE INTO site_settings (setting_key, setting_value) VALUES
('contact_hours', 'Monday – Friday | 8:00 AM – 7:00 PM EST\nSaturday | 9:00 AM – 4:00 PM EST\nSunday | Private Appointments Only'),
('contact_faq', 'What documentation do I need to prepare for an asset appraisal? | For a precise primary luxury asset evaluation, have current title records, property survey plans, and tax history ready for our specialist analysis.\nCan I request out-of-hours or holiday viewings? | Yes, premium account tiers have access to direct off-schedule VIP walkthroughs, coordinated through your specific point-of-contact advisor.\nHow long does the corporate legal onboarding process take? | Standard corporate acquisitions clear within 7 to 14 standard legal days, entirely managed under our automated escrow pipelines.'),
('contact_whatsapp', '918585033913'),
('contact_map', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.1422937950147!2d-73.9732!3d40.7644!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQ1JzUxLjgiTiA3M8KwNTgnMjMuNSJX!5e0!3m2!1sen!2sus!4v1650000000000!5m2!1sen!2sus');

-- About page: remaining sections (hero extras, awards, overview, values, journey, gallery, team, testimonials, cta)
INSERT IGNORE INTO site_settings (setting_key, setting_value) VALUES
('about_hero_eyebrow', 'Redefining Modern Living'),
('about_hero_trust', '12,000+ | happy families\n4.9 | on Google'),
('about_hero_stats', '1200+ | Properties Managed\n99.2% | Client Satisfaction'),
('about_hero_highlights', 'Award-Winning Brokerage | Trusted since 2010 · RERA registered\n$2.4B+ in Sales Volume | Across 50+ cities worldwide'),
('about_awards', 'Top Broker 2024\nRERA Registered\nGoogle 4.9 Rating\nISO 9001 Certified\n12,000+ Happy Families\nLuxury Portfolio Award\n50+ Cities Covered\nTrusted Advisors'),
('about_overview_eyebrow', 'Who We Are'),
('about_overview_title', 'Pioneering Excellence in Luxury Real Estate'),
('about_overview_para', 'Founded with a vision to revolutionize real estate transactions, Edge Realty has grown into a premier brokerage trusted by high-net-worth individuals, investors and families worldwide.\n\nWe fuse deep local market expertise with cutting-edge analytics to deliver an unparalleled property search and acquisition experience.'),
('about_overview_list', '50-point physical & legal verification on every listing\nDedicated advisor from shortlist to handover\nTransparent, data-backed valuation reports'),
('about_overview_stats', '$2.4B+ | Volume Sold\n50+ | Cities Covered\n15+ | Years of Trust'),
('about_overview_img1', 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80'),
('about_overview_img2', 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80'),
('about_overview_badge_title', 'Award Winning'),
('about_overview_badge_sub', 'Trusted brokerage since 2010'),
('about_mission_title', 'Our Mission'),
('about_vision_title', 'Our Vision'),
('about_values_eyebrow', 'Why Choose Us'),
('about_values_title', 'Why Discerning Clients Choose Us'),
('about_values_sub', 'Excellence isn''t an accident — it''s our standard operating procedure.'),
('about_values', 'Vetted Portfolio | Every property undergoes a rigorous 50-point physical & legal inspection.\nData-Driven Insights | Real-time neighbourhood trends and long-term yield projections.\nEnd-to-End Concierge | Legal, financial and interior design advisory under one roof.\nAbsolute Transparency | No hidden fees, no surprise commissions — clarity at every step.\nGlobal Reach | Local expertise amplified by an international buyer network.\nProp-Tech Platform | Virtual tours, instant valuation and digital closing, built in.'),
('about_milestones_eyebrow', 'Our Journey'),
('about_milestones_title', 'A Decade of Milestones'),
('about_milestones_sub', 'From a single office to a nationally recognised brokerage — built one trusted relationship at a time.'),
('about_milestones', '2010 | The Beginning | Founded in a single office with a bold promise: integrity above commission.\n2014 | Regional Expansion | Opened three new branches and crossed 200 successful property closures.\n2018 | Prop-Tech Launch | Introduced our digital valuation engine and virtual tour platform.\n2021 | 1,000th Home Sold | Reached a milestone family and expanded into commercial portfolios.\n2024 | National Recognition | Named Top Brokerage and surpassing $2B in lifetime sales volume.\n2026 | Global Network | Serving clients across 50+ cities with 12,000+ delighted families.'),
('about_steps_eyebrow', 'How It Works'),
('about_steps_title', 'The Acquisition Journey'),
('about_steps_sub', 'A structured four-step path to secure your property effortlessly.'),
('about_steps', 'Consultation | Understanding your investment criteria and lifestyle desires.\nCuration | Presenting off-market and hand-selected luxury residences.\nAcquisition | Seamless negotiation, legal due diligence and closing.\nManagement | Post-purchase property setup and yield management.'),
('about_gallery_eyebrow', 'Inside Edge'),
('about_gallery_title', 'Where Expertise Meets Elegance'),
('about_gallery_sub', 'A glimpse into the spaces where we craft property experiences.'),
('about_gallery', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80 | Our Headquarters\nhttps://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80 | Client Meetings\nhttps://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80 | Advisory Lounge\nhttps://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80 | Workspace'),
('about_team_eyebrow', 'Our People'),
('about_team_title', 'Leadership Team'),
('about_team_sub', 'Industry veterans driven by integrity, passion and innovation.'),
('about_team', 'Sarah Jenkins | Managing Principal & Founder | https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80\nDavid Chen | Head of Global Acquisitions | https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80\nElena Rostova | Director of Luxury Estates | https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80\nMarcus Webb | Head of Client Relations | https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80'),
('about_testimonials', 'Edge Realty made purchasing our coastal estate smooth beyond expectation. Their market foresight and discretion are completely unmatched. | Marcus & Eleanor Vance | Estate Buyers\nAs an NRI investor, I needed a team I could trust blindly. Their data reports and virtual tours made closing remotely effortless. | Priya Sharma | Property Investor\nFrom shortlist to handover, every step was transparent. The concierge team even handled our interiors. Truly end-to-end service. | James Okafor | First-time Homeowner'),
('about_cta_eyebrow', 'Let''s Begin'),
('about_cta_card_title', 'Reach us directly');

-- Legal pages: dedicated Privacy Policy & Terms & Conditions (public GET /content, prefix legal_)
INSERT IGNORE INTO site_settings (setting_key, setting_value) VALUES
('legal_privacy_title', 'Privacy Policy'),
('legal_privacy_updated', 'Last updated: 24 October 2026'),
('legal_privacy_content', 'This Privacy Policy explains how Edge Mile Realty ("we", "us" or "our") collects, uses and protects your information when you visit our website or use our property listing and advisory services.\n\nInformation you provide — account details such as your name, email address and phone number; property details when you list a property or send an enquiry; and any documents you share during verification. Information collected automatically — device, browser and usage data such as pages viewed and referring pages, collected through cookies and similar technologies.\n\nWe use the information to provide and improve our services, verify listings, respond to enquiries, send service-related notifications, prevent fraud and comply with legal obligations.\n\nWe use cookies and analytics tools to remember your preferences and understand how the site is used. You can control cookies through your browser settings; disabling cookies may affect some features of the website.\n\nWe do not sell your personal information. We share it only with our verification and service partners, professional advisers, or public authorities when required by law.\n\nWe use reasonable technical and organisational measures to protect your information, but no method of transmission over the Internet is completely secure.\n\nWe retain personal information only for as long as needed for the purposes described here or as required by law, after which it is deleted or anonymised.\n\nYou may request access to, correction of, or deletion of your personal information, and opt out of marketing messages, by writing to us at the contact details below.\n\nOur website may contain links to third-party websites. We are not responsible for their content or privacy practices.\n\nOur services are not directed to children under 18, and we do not knowingly collect information from them.\n\nWe may update this Privacy Policy from time to time. The latest version will always be available on this page with its effective date.\n\nQuestions about this Privacy Policy? Contact Edge Mile Realty, 59/1 Panchanan Tala Road, Howrah- 711101, email info@edgemilerealty.com, phone (+91) 8585033913.'),
('legal_terms_title', 'Terms & Conditions'),
('legal_terms_updated', 'Last updated: 24 October 2026'),
('legal_terms_content', 'These Terms & Conditions govern your use of the Edge Mile Realty website and services. By accessing or using our platform you agree to be bound by them.\n\nYou must be at least 18 years old to use our services. You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.\n\nProperty listings and other content are provided for information only. While we strive for accuracy, we do not warrant that listings, prices, availability or descriptions are complete, current or error-free, and you should verify all details independently before any transaction.\n\nEdge Mile Realty is a platform connecting property owners, buyers and tenants. We are not a party to any agreement between users and are not responsible for the conduct, obligations or representations of users.\n\nOur zero-brokerage model means we do not charge buyers or tenants brokerage commission for platform-listed transactions. Applicable fees, if any, will always be shown before you confirm a paid service.\n\nYou agree not to post false or misleading listings, impersonate others, spam or harass users, scrape or misuse platform data, upload harmful code, or use the service for any unlawful purpose.\n\nYou retain ownership of the content you submit and grant us a non-exclusive licence to host, display and promote it as part of the service.\n\nThe website design, logo, text and software are owned by or licensed to Edge Mile Realty and may not be copied or used without our prior written permission.\n\nOur site may link to third-party websites. We do not endorse them and are not responsible for their content or practices.\n\nThe service is provided on an "as is" and "as available" basis without warranties of any kind, express or implied.\n\nTo the maximum extent permitted by law, Edge Mile Realty shall not be liable for any indirect, incidental or consequential damages arising from your use of the service.\n\nYou agree to indemnify and hold Edge Mile Realty harmless from claims arising out of your content or your misuse of the service.\n\nWe may suspend or terminate your access at any time for breach of these terms.\n\nThese terms are governed by the laws of India, and the courts at Howrah, West Bengal shall have exclusive jurisdiction.\n\nWe may revise these Terms from time to time; continued use of the service means acceptance of the revised terms. For questions contact us at 59/1 Panchanan Tala Road, Howrah- 711101 or info@edgemilerealty.com.');

-- Footer menu: Privacy & Terms links at the top. Pages (/privacy-policy,
-- /terms-and-conditions) render admin-managed data from Page Content → Legal
-- (legal_* keys) — no hardcoded content on the pages.
INSERT IGNORE INTO footer_links (label, url, sort_order, status) VALUES
('Privacy Policy', '/privacy-policy', 1, 1),
('Terms & Conditions', '/terms-and-conditions', 2, 1);

UPDATE footer_links SET sort_order = 3 WHERE url = '/cancellation-refund-policy';
UPDATE footer_links SET sort_order = 4 WHERE url = '/user-conduct-policy';
UPDATE footer_links SET sort_order = 5 WHERE url = '/listing-policy';
UPDATE footer_links SET sort_order = 6 WHERE url = '/advertisement-policy';
UPDATE footer_links SET sort_order = 7 WHERE url = '/anti-fraud-policy';
UPDATE footer_links SET sort_order = 8 WHERE url = '/grievance-hierarchy';

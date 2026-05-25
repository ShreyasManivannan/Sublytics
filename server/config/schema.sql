-- Sublytics AI (formerly SubGuard) MySQL Database Schema
-- Run this file against your MySQL database to create all required tables.

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    name                VARCHAR(255) NOT NULL,
    email               VARCHAR(255) UNIQUE NOT NULL,
    password_hash       VARCHAR(255),
    google_id           VARCHAR(255) UNIQUE,
    avatar_url          TEXT,
    gmail_connected     TINYINT(1) DEFAULT 0,
    gmail_refresh_token TEXT,
    email_notifications TINYINT(1) DEFAULT 1,
    sms_notifications   TINYINT(1) DEFAULT 0,
    reminder_days       INT DEFAULT 3,
    phone               VARCHAR(20),
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_google_id (google_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- SUBSCRIPTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    service_name    VARCHAR(255) NOT NULL,
    amount          DECIMAL(10, 2) NOT NULL,
    billing_cycle   VARCHAR(20) NOT NULL,
    category        VARCHAR(50),
    renewal_date    DATE NOT NULL,
    autopay         TINYINT(1) DEFAULT 0,
    status          VARCHAR(20) DEFAULT 'active',
    icon_url        TEXT,
    notes           TEXT,
    currency        VARCHAR(10) DEFAULT 'USD',
    payment_method  VARCHAR(100) DEFAULT 'Visa',
    split_count     INT DEFAULT 1,
    last_used_at    DATE NULL,
    invoice_url     TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_subscriptions_user_id (user_id),
    INDEX idx_subscriptions_renewal_date (renewal_date),
    INDEX idx_subscriptions_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    subscription_id INT NULL,
    type            VARCHAR(20) NOT NULL,
    status          VARCHAR(20) DEFAULT 'pending',
    message         TEXT,
    sent_at         TIMESTAMP NULL DEFAULT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL,
    INDEX idx_notifications_user_id (user_id),
    INDEX idx_notifications_subscription_id (subscription_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

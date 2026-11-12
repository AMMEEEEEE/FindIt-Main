CREATE DATABASE IF NOT EXISTS findit
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE findit;

-- People who can log in
CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  reg_no        VARCHAR(30)  NOT NULL UNIQUE,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wallet, Phone, Keys...
CREATE TABLE categories (
  id   INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO categories (name) VALUES
  ('Wallet'), ('Phone'), ('Keys'), ('Bag'),
  ('Books'), ('ID card'), ('Electronics'), ('Other');

-- Every lost or found report
CREATE TABLE items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  type        ENUM('lost', 'found') NOT NULL,
  name        VARCHAR(150) NOT NULL,
  category_id INT NOT NULL,
  location    VARCHAR(150) NOT NULL,
  item_date   DATE NOT NULL,
  description TEXT NOT NULL,
  contact     VARCHAR(20) NOT NULL,        -- private, never shown publicly
  image_path  VARCHAR(255) NULL,
  status      ENUM('open', 'pending', 'resolved') NOT NULL DEFAULT 'open',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)     REFERENCES users(id)      ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  INDEX idx_items_status (status)
);

-- Ownership claims on items
CREATE TABLE claims (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  item_id     INT NOT NULL,
  user_id     INT NOT NULL,                -- the person claiming
  answer      TEXT NOT NULL,
  status      ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP NULL,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY one_claim_per_user (item_id, user_id)
);
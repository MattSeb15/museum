/*
  # Initial Schema Setup for Museum Admin Panel

  1. New Tables
    - `site_config`
      - Global site configuration like museum name
    - `artworks`
      - Artwork information and metadata
    - `products`
      - Shop products configuration
    - `about_content`
      - About page content and configuration
    
  2. Security
    - Enable RLS on all tables
    - Add policies for admin access
*/

-- Create an admin_users table to track admin privileges
CREATE TABLE admin_users (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (id)
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Site Configuration
CREATE TABLE site_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  museum_name TEXT NOT NULL DEFAULT 'Museo de Kerli',
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES admin_users(id)
);

ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- Artworks Table
CREATE TABLE artworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  year TEXT NOT NULL,
  description TEXT NOT NULL,
  medium TEXT NOT NULL,
  dimensions TEXT NOT NULL,
  location TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES admin_users(id)
);

ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;

-- Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  mockup_image TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES admin_users(id)
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- About Page Content
CREATE TABLE about_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_image TEXT NOT NULL,
  artist_image TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  hero_subtitle TEXT NOT NULL,
  bio_text TEXT[] NOT NULL,
  achievements JSONB NOT NULL,
  quote TEXT NOT NULL,
  quote_author TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES admin_users(id)
);

ALTER TABLE about_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow admin read access" ON admin_users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Allow admin full access to site_config" ON site_config
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

CREATE POLICY "Allow admin full access to artworks" ON artworks
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

CREATE POLICY "Allow admin full access to products" ON products
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

CREATE POLICY "Allow admin full access to about_content" ON about_content
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

-- Public read access for content
CREATE POLICY "Allow public read access to site_config" ON site_config
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Allow public read access to artworks" ON artworks
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Allow public read access to products" ON products
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Allow public read access to about_content" ON about_content
  FOR SELECT TO anon
  USING (true);

-- Function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM admin_users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
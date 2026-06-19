-- Karun Fruits dummy data seed.
-- Mirrors backend/src/main/java/com/karunfruits/config/DataSeeder.java exactly, so the
-- two stay equivalent. Safe to run multiple times: it no-ops if products already exist.
--
-- How to run:
--   Neon console:  paste this whole file into the SQL editor and run it.
--   psql:          psql "$DATABASE_URL" -f backend/seed-data.sql

DO $$
DECLARE
    img1 text := 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&h=600&fit=crop';
    img2 text := 'https://images.unsplash.com/photo-1574570068036-f8f3bfb79571?w=600&h=600&fit=crop';
    img3 text := 'https://images.unsplash.com/photo-1604506818543-d45ca0f04a3a?w=600&h=600&fit=crop';
    img4 text := 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600&h=600&fit=crop';
BEGIN
    IF (SELECT COUNT(*) FROM products) > 0 THEN
        RAISE NOTICE 'Products table is not empty - skipping seed.';
        RETURN;
    END IF;

    -- ── Categories ──────────────────────────────────────────────
    INSERT INTO categories (name, slug, description, image_url, active, sort_order) VALUES
        ('Almonds',      'almonds',    'Hand-picked premium almonds sourced from the finest orchards.', img1, true, 1),
        ('Cashews',      'cashews',    'Creamy, whole cashews graded for size and quality.',            img2, true, 2),
        ('Pistachios',   'pistachios', 'Iranian and Californian pistachios, lightly roasted and salted.', img3, true, 3),
        ('Walnuts',      'walnuts',    'Kashmiri and Californian walnuts, rich and nutritious.',        img4, true, 4),
        ('Dates & Figs', 'dates',      'Soft, naturally sweet dates and dried figs.',                   img1, true, 5),
        ('Seeds',        'seeds',      'Nutrient-dense seeds for a healthy daily diet.',                img2, true, 6),
        ('Makhana',      'makhana',    'Light, crunchy fox nuts roasted to perfection.',                img3, true, 7),
        ('Gift Boxes',   'gift-boxes', 'Curated dry fruit hampers for every celebration.',               img4, true, 8)
    ON CONFLICT (slug) DO NOTHING;

    -- ── Products ────────────────────────────────────────────────
    -- name, slug, description, category_slug, price, sale_price, stock, weight, unit, sku, active, featured, bestseller, is_new, rating, review_count, image_url
    INSERT INTO products (name, slug, description, category_id, price, sale_price, stock, weight, unit, sku, active, featured, bestseller, is_new, rating, review_count)
    SELECT v.name, v.slug, v.description, c.id, v.price, v.sale_price, v.stock, v.weight, v.unit, v.sku, true, v.featured, v.bestseller, v.is_new, v.rating, v.review_count
    FROM (VALUES
        ('Premium California Almonds', 'almonds-premium-california-almonds', 'Premium quality premium california almonds, carefully sourced and packed to preserve freshness and nutrition.', 'almonds',    599::numeric,  499::numeric, 80, 500,  'g', 'ALM-CAL-500', true,  true,  false, 4.7, 128),
        ('Mamra Almonds Premium',      'almonds-mamra-almonds-premium',      'Premium quality mamra almonds premium, carefully sourced and packed to preserve freshness and nutrition.',       'almonds',    899::numeric,  NULL,         40, 250,  'g', 'ALM-MAM-250', false, false, true,  4.5, 64),
        ('Roasted Salted Almonds',     'almonds-roasted-salted-almonds',     'Premium quality roasted salted almonds, carefully sourced and packed to preserve freshness and nutrition.',       'almonds',    449::numeric,  399::numeric, 60, 400,  'g', 'ALM-RST-400', false, false, false, 4.3, 52),

        ('Whole Cashews W240',         'cashews-whole-cashews-w240',         'Premium quality whole cashews w240, carefully sourced and packed to preserve freshness and nutrition.',         'cashews',    699::numeric,  599::numeric, 70, 500,  'g', 'CSH-W240-500', true,  false, false, 4.6, 96),
        ('Roasted Cashew Nuts',        'cashews-roasted-cashew-nuts',        'Premium quality roasted cashew nuts, carefully sourced and packed to preserve freshness and nutrition.',        'cashews',    399::numeric,  NULL,         55, 250,  'g', 'CSH-RST-250', false, true,  false, 4.4, 70),
        ('Broken Cashew Pieces',       'cashews-broken-cashew-pieces',       'Premium quality broken cashew pieces, carefully sourced and packed to preserve freshness and nutrition.',       'cashews',    549::numeric,  499::numeric, 45, 500,  'g', 'CSH-BRK-500', false, false, false, 4.1, 30),

        ('Iranian Pistachios',         'pistachios-iranian-pistachios',      'Premium quality iranian pistachios, carefully sourced and packed to preserve freshness and nutrition.',        'pistachios', 849::numeric,  749::numeric, 50, 250,  'g', 'PIS-IRN-250', true,  false, false, 4.8, 110),
        ('Roasted Salted Pistachios',  'pistachios-roasted-salted-pistachios','Premium quality roasted salted pistachios, carefully sourced and packed to preserve freshness and nutrition.',    'pistachios', 799::numeric,  NULL,         35, 250,  'g', 'PIS-RST-250', false, false, true,  4.5, 40),
        ('California Pistachios',      'pistachios-california-pistachios',   'Premium quality california pistachios, carefully sourced and packed to preserve freshness and nutrition.',        'pistachios', 1499::numeric, 1349::numeric,25, 500, 'g', 'PIS-CAL-500', false, false, false, 4.6, 58),

        ('Walnut Kernels Premium',     'walnuts-walnut-kernels-premium',     'Premium quality walnut kernels premium, carefully sourced and packed to preserve freshness and nutrition.',       'walnuts',    649::numeric,  599::numeric, 65, 500,  'g', 'WAL-KER-500', true,  false, false, 4.4, 84),
        ('Kashmiri Walnuts In-Shell',  'walnuts-kashmiri-walnuts-in-shell',  'Premium quality kashmiri walnuts in-shell, carefully sourced and packed to preserve freshness and nutrition.',   'walnuts',    799::numeric,  NULL,         30, 1000, 'g', 'WAL-KSH-1000',false, true,  false, 4.3, 45),
        ('Walnut Halves & Pieces',     'walnuts-walnut-halves-pieces',       'Premium quality walnut halves & pieces, carefully sourced and packed to preserve freshness and nutrition.',       'walnuts',    349::numeric,  299::numeric, 50, 250,  'g', 'WAL-HLV-250', false, false, false, 4.0, 22),

        ('Medjool Dates',              'dates-medjool-dates',                'Premium quality medjool dates, carefully sourced and packed to preserve freshness and nutrition.',               'dates',      499::numeric,  449::numeric, 90, 500,  'g', 'DAT-MED-500', true,  false, false, 4.7, 132),
        ('Dried Figs (Anjeer)',        'dates-dried-figs-anjeer',            'Premium quality dried figs (anjeer), carefully sourced and packed to preserve freshness and nutrition.',         'dates',      449::numeric,  NULL,         40, 250,  'g', 'FIG-ANJ-250', false, false, true,  4.5, 58),
        ('Ajwa Dates Premium',         'dates-ajwa-dates-premium',           'Premium quality ajwa dates premium, carefully sourced and packed to preserve freshness and nutrition.',           'dates',      699::numeric,  649::numeric, 35, 400,  'g', 'DAT-AJW-400', false, false, false, 4.6, 39),

        ('Pumpkin Seeds',              'seeds-pumpkin-seeds',                'Premium quality pumpkin seeds, carefully sourced and packed to preserve freshness and nutrition.',               'seeds',      349::numeric,  299::numeric, 60, 250,  'g', 'SED-PUM-250', true,  false, false, 4.3, 47),
        ('Chia Seeds',                 'seeds-chia-seeds',                   'Premium quality chia seeds, carefully sourced and packed to preserve freshness and nutrition.',                  'seeds',      199::numeric,  NULL,         75, 200,  'g', 'SED-CHI-200', false, true,  false, 4.2, 60),
        ('Flax Seeds',                 'seeds-flax-seeds',                   'Premium quality flax seeds, carefully sourced and packed to preserve freshness and nutrition.',                  'seeds',      149::numeric,  129::numeric, 80, 250,  'g', 'SED-FLX-250', false, false, false, 4.0, 25),

        ('Roasted Makhana Classic',    'makhana-roasted-makhana-classic',    'Premium quality roasted makhana classic, carefully sourced and packed to preserve freshness and nutrition.',       'makhana',    249::numeric,  199::numeric, 70, 100,  'g', 'MAK-CLS-100', true,  false, false, 4.4, 71),
        ('Peri Peri Makhana',          'makhana-peri-peri-makhana',          'Premium quality peri peri makhana, carefully sourced and packed to preserve freshness and nutrition.',           'makhana',    269::numeric,  NULL,         50, 100,  'g', 'MAK-PER-100', false, false, true,  4.3, 33),
        ('Plain Fox Nuts',             'makhana-plain-fox-nuts',             'Premium quality plain fox nuts, carefully sourced and packed to preserve freshness and nutrition.',                'makhana',    399::numeric,  349::numeric, 45, 200,  'g', 'MAK-PLN-200', false, false, false, 4.1, 18),

        ('Festive Dry Fruit Gift Box', 'gift-boxes-festive-dry-fruit-gift-box','Premium quality festive dry fruit gift box, carefully sourced and packed to preserve freshness and nutrition.',  'gift-boxes', 1499::numeric, 1299::numeric,30, 1000,'g', 'GFT-FST-1000',true,  false, false, 4.9, 88),
        ('Diwali Special Hamper',      'gift-boxes-diwali-special-hamper',   'Premium quality diwali special hamper, carefully sourced and packed to preserve freshness and nutrition.',          'gift-boxes', 1999::numeric, 1799::numeric,20, 1500,'g', 'GFT-DIW-1500',false, true,  false, 4.7, 64),
        ('Premium Assorted Nuts Box',  'gift-boxes-premium-assorted-nuts-box','Premium quality premium assorted nuts box, carefully sourced and packed to preserve freshness and nutrition.',     'gift-boxes', 1199::numeric, NULL,         25, 750, 'g', 'GFT-ASR-750', false, false, false, 4.5, 41)
    ) AS v(name, slug, description, category_slug, price, sale_price, stock, weight, unit, sku, featured, bestseller, is_new, rating, review_count)
    JOIN categories c ON c.slug = v.category_slug
    ON CONFLICT (slug) DO NOTHING;

    -- ── Product images (one primary image per product) ────────
    INSERT INTO product_images (product_id, url, "primary", sort_order)
    SELECT p.id,
           CASE p.category_id
               WHEN (SELECT id FROM categories WHERE slug = 'almonds')    THEN img1
               WHEN (SELECT id FROM categories WHERE slug = 'cashews')    THEN img2
               WHEN (SELECT id FROM categories WHERE slug = 'pistachios') THEN img3
               WHEN (SELECT id FROM categories WHERE slug = 'walnuts')    THEN img4
               WHEN (SELECT id FROM categories WHERE slug = 'dates')      THEN img1
               WHEN (SELECT id FROM categories WHERE slug = 'seeds')      THEN img2
               WHEN (SELECT id FROM categories WHERE slug = 'makhana')    THEN img3
               WHEN (SELECT id FROM categories WHERE slug = 'gift-boxes') THEN img4
           END,
           true, 0
    FROM products p
    WHERE NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id);

    -- ── Product variants (single pack size matching the base price) ─
    INSERT INTO product_variants (product_id, name, weight, unit, price, sale_price, stock)
    SELECT p.id,
           p.weight || p.unit,
           p.weight, p.unit, p.price, p.sale_price, p.stock
    FROM products p
    WHERE NOT EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id);

    RAISE NOTICE 'Seed complete: % categories, % products', (SELECT COUNT(*) FROM categories), (SELECT COUNT(*) FROM products);
END $$;

// backend/seed_products.js
const mysql = require('mysql2/promise');

const products = [
    // Produce
    { name: 'Organic Bananas (1 Dozen)', cat: 'Produce', price: 2.99, disc: 2.49, img: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=400&q=80' },
    { name: 'Red Gala Apples (1kg)', cat: 'Produce', price: 4.50, disc: 3.99, img: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80' },
    { name: 'Fresh Hass Avocados (Pack of 4)', cat: 'Produce', price: 5.99, disc: 4.99, img: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=400&q=80' },
    { name: 'Organic Baby Spinach (250g)', cat: 'Produce', price: 3.20, disc: 2.80, img: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80' },
    { name: 'Juicy Roma Tomatoes (1kg)', cat: 'Produce', price: 2.80, disc: 2.30, img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80' },
    { name: 'Fresh Strawberries (400g)', cat: 'Produce', price: 4.99, disc: 3.99, img: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=400&q=80' },
    { name: 'Whole Broccoli Crown', cat: 'Produce', price: 2.10, disc: 1.80, img: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=400&q=80' },
    { name: 'Crisp English Cucumber', cat: 'Produce', price: 1.50, disc: 1.20, img: 'https://images.unsplash.com/photo-1447175008436-08417192a620?auto=format&fit=crop&w=400&q=80' },

    // Dairy
    { name: 'Whole Organic Milk 1 Gallon', cat: 'Dairy', price: 4.80, disc: 4.20, img: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80' },
    { name: 'Sharp Cheddar Cheese Block (400g)', cat: 'Dairy', price: 5.50, disc: 4.75, img: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=400&q=80' },
    { name: 'Greek Vanilla Yogurt (900g)', cat: 'Dairy', price: 6.20, disc: 5.30, img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80' },
    { name: 'Unsalted Artisan Butter (454g)', cat: 'Dairy', price: 4.20, disc: 3.60, img: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=400&q=80' },
    { name: 'Organic Large Eggs (Grade A 12ct)', cat: 'Dairy', price: 3.99, disc: 3.49, img: 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?auto=format&fit=crop&w=400&q=80' },
    { name: 'Heavy Whipping Cream (500ml)', cat: 'Dairy', price: 3.50, disc: 2.99, img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80' },
    { name: 'Almond Milk Unsweetened 1L', cat: 'Dairy', price: 3.80, disc: 3.20, img: 'https://images.unsplash.com/photo-1600788886242-5c96aabe3757?auto=format&fit=crop&w=400&q=80' },

    // Bakery
    { name: 'Artisan Sourdough Loaf', cat: 'Bakery', price: 4.20, disc: 3.50, img: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=400&q=80' },
    { name: 'Fresh Butter Croissants (4 Pack)', cat: 'Bakery', price: 5.00, disc: 4.20, img: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=400&q=80' },
    { name: 'Whole Wheat Sandwich Bread', cat: 'Bakery', price: 2.99, disc: 2.49, img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80' },
    { name: 'Double Chocolate Chip Muffins (2ct)', cat: 'Bakery', price: 3.80, disc: 3.00, img: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=400&q=80' },
    { name: 'Cinnamon Bagels (6 Pack)', cat: 'Bakery', price: 4.10, disc: 3.50, img: 'https://images.unsplash.com/photo-1585478259715-876acc5be8eb?auto=format&fit=crop&w=400&q=80' },

    // Beverages
    { name: 'Cold Brew Coffee Concentrate (1L)', cat: 'Beverages', price: 8.99, disc: 7.49, img: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=400&q=80' },
    { name: 'Sparkling Lime Water (12 Can Pack)', cat: 'Beverages', price: 6.50, disc: 5.50, img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80' },
    { name: '100% Pure Orange Juice (1.5L)', cat: 'Beverages', price: 4.80, disc: 3.99, img: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=400&q=80' },
    { name: 'Organic Green Tea (20 Bags)', cat: 'Beverages', price: 3.99, disc: 3.20, img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80' },
    { name: 'Electrolyte Coconut Water (500ml)', cat: 'Beverages', price: 2.99, disc: 2.49, img: 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=400&q=80' },
    { name: 'Craft Kombucha Ginger Berry', cat: 'Beverages', price: 3.99, disc: 3.49, img: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=400&q=80' },

    // Snacks
    { name: 'Sea Salt Kettle Potato Chips (200g)', cat: 'Snacks', price: 3.50, disc: 2.80, img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&q=80' },
    { name: 'Roasted Almonds & Walnut Mix', cat: 'Snacks', price: 7.99, disc: 6.50, img: 'https://images.unsplash.com/photo-1536591375315-1b836814d2b9?auto=format&fit=crop&w=400&q=80' },
    { name: '70% Dark Chocolate Bar (100g)', cat: 'Snacks', price: 2.99, disc: 2.40, img: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=400&q=80' },
    { name: 'Organic Rice Cakes Salted', cat: 'Snacks', price: 2.20, disc: 1.80, img: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=400&q=80' },
    { name: 'Gourmet White Cheddar Popcorn', cat: 'Snacks', price: 3.20, disc: 2.60, img: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=400&q=80' },
    { name: 'Peanut Butter Protein Bars (5 Pack)', cat: 'Snacks', price: 6.99, disc: 5.99, img: 'https://images.unsplash.com/photo-1622484210800-2d887a2243d4?auto=format&fit=crop&w=400&q=80' },

    // Pantry
    { name: 'Extra Virgin Olive Oil 1L', cat: 'Pantry', price: 12.50, disc: 10.99, img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80' },
    { name: 'Aromatic Basmati Rice (5kg)', cat: 'Pantry', price: 15.99, disc: 13.99, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80' },
    { name: 'Organic Penne Rigate Pasta (500g)', cat: 'Pantry', price: 1.99, disc: 1.50, img: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281318?auto=format&fit=crop&w=400&q=80' },
    { name: 'Marinara Tomato Pasta Sauce', cat: 'Pantry', price: 3.80, disc: 3.10, img: 'https://images.unsplash.com/photo-1572441712052-8933759f2732?auto=format&fit=crop&w=400&q=80' },
    { name: 'Raw Wildflower Honey (500g)', cat: 'Pantry', price: 7.50, disc: 6.20, img: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80' },
    { name: 'Whole Black Peppercorns Grinder', cat: 'Pantry', price: 3.99, disc: 3.29, img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80' },
    { name: 'Organic Rolled Oats (1kg)', cat: 'Pantry', price: 4.20, disc: 3.50, img: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=400&q=80' },
    { name: 'Creamy Peanut Butter (750g)', cat: 'Pantry', price: 4.99, disc: 4.20, img: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=400&q=80' },

    // Household
    { name: 'Ultra Soft Bath Tissue (12 Rolls)', cat: 'Household', price: 10.99, disc: 8.99, img: 'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?auto=format&fit=crop&w=400&q=80' },
    { name: 'Eco Dishwashing Liquid 1L', cat: 'Household', price: 3.50, disc: 2.99, img: 'https://images.unsplash.com/photo-1585830812416-a6c86bb14576?auto=format&fit=crop&w=400&q=80' },
    { name: 'All-Purpose Spray Cleaner', cat: 'Household', price: 4.20, disc: 3.50, img: 'https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?auto=format&fit=crop&w=400&q=80' },
    { name: 'Laundry Detergent Pods (42ct)', cat: 'Household', price: 13.99, disc: 11.99, img: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=400&q=80' },
    { name: 'Microfiber Cleaning Cloths (6 Pack)', cat: 'Household', price: 5.99, disc: 4.80, img: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=400&q=80' },
    { name: 'Heavy Duty Trash Bags (30 Gallon)', cat: 'Household', price: 8.50, disc: 7.20, img: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=400&q=80' },
    { name: 'Anti-Bacterial Hand Soap (500ml)', cat: 'Household', price: 2.99, disc: 2.30, img: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=400&q=80' },
    { name: 'Aluminum Foil Roll 75 Sq Ft', cat: 'Household', price: 4.50, disc: 3.80, img: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=400&q=80' }
];

async function seed() {
    const db = await mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'your_mysql_password', // Update to match your MySQL password
        database: 'retail_ai_db'
    });

    console.log('Clearing existing product catalog...');
    await db.query('DELETE FROM products');

    console.log(`Seeding ${products.length} products into SmartRetail database...`);
    for (const p of products) {
        await db.query(
            'INSERT INTO products (store_id, name, category, price, discount_price, stock_quantity, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [1, p.name, p.cat, p.price, p.disc, Math.floor(Math.random() * 80) + 20, p.img]
        );
    }

    console.log('Product Database Seed Complete! 50+ Products Inserted.');
    process.exit();
}

seed().catch(console.error);
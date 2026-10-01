const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'your_mysql_password', // Update with your MySQL password
    database: 'retail_ai_db',
    waitForConnections: true,
    connectionLimit: 10
});

// Haversine Distance helper (km)
function getHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// 1. Geolocation nearest store endpoint
app.get('/api/stores/nearest', async (req, res) => {
    try {
        const { lat, lon } = req.query;
        const [stores] = await db.query('SELECT * FROM stores');
        
        if (!lat || !lon) return res.json(stores[0]);

        let nearest = null;
        let minDist = Infinity;

        stores.forEach(s => {
            const d = getHaversineDistance(parseFloat(lat), parseFloat(lon), s.latitude, s.longitude);
            if (d < minDist) {
                minDist = d;
                nearest = { ...s, distance_km: d.toFixed(2) };
            }
        });

        res.json(nearest || stores[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Fetch products with pagination & search
app.get('/api/products/:storeId', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const offset = (page - 1) * limit;
        const category = req.query.category || '';
        const search = req.query.search || '';

        let query = 'SELECT * FROM products WHERE store_id = ?';
        let params = [req.params.storeId];

        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }
        if (search) {
            query += ' AND name LIKE ?';
            params.push(`%${search}%`);
        }

        query += ' ORDER BY product_id ASC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const [products] = await db.query(query, params);

        let countQuery = 'SELECT COUNT(*) as total FROM products WHERE store_id = ?';
        let countParams = [req.params.storeId];
        if (category) { countQuery += ' AND category = ?'; countParams.push(category); }
        if (search) { countQuery += ' AND name LIKE ?'; countParams.push(`%${search}%`); }

        const [[{ total }]] = await db.query(countQuery, countParams);

        res.json({ products, currentPage: page, totalPages: Math.ceil(total / limit) || 1, totalProducts: total });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Queue Analytics & AI Microservice Trigger
app.get('/api/queue/analytics/:storeId', async (req, res) => {
    try {
        const [counters] = await db.query('SELECT * FROM billing_counters WHERE store_id = ?', [req.params.storeId]);
        const activeCounters = counters.filter(c => c.status !== 'inactive').length;
        const totalQueue = counters.reduce((sum, c) => sum + c.current_queue_count, 0);
        const avgTime = counters.reduce((sum, c) => sum + c.avg_processing_time_sec, 0) / (counters.length || 1);

        let aiInsights = {};
        try {
            const aiRes = await axios.post('http://127.0.0.1:5001/predict-queue', {
                active_counters: activeCounters,
                queue_total: totalQueue,
                avg_scan_time: avgTime
            });
            aiInsights = aiRes.data;
        } catch (e) {
            aiInsights = { current_predicted_wait_min: (totalQueue * 2.2).toFixed(1), recommendation: "AI service offline", congestion_status: "Moderate" };
        }

        res.json({ counters, totalQueueCount: totalQueue, activeCounters, aiInsights });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Digital Order Checkout & QR Receipt Hash
app.post('/api/orders/checkout', async (req, res) => {
    try {
        const { storeId, totalAmount, paymentMode } = req.body;
        const qrHash = 'SR-' + Math.random().toString(36).substring(2, 11).toUpperCase();
        
        const [result] = await db.query(
            'INSERT INTO orders (store_id, total_amount, payment_mode, qr_code_hash) VALUES (?, ?, ?, ?)',
            [storeId, totalAmount, paymentMode, qrHash]
        );

        res.json({ success: true, orderId: result.insertId, qrCodeHash: qrHash });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(5000, () => console.log('Node.js REST API listening on port 5000'));
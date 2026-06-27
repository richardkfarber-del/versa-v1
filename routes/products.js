const express = require('express');
const router = express.Router();
const { authenticateToken } = require('./relationship');
const { db, decryptText, hashDesireTag } = require('../database');

// GET /api/v1/products/recommend/:pairing_id
router.get('/recommend/:pairing_id', authenticateToken, (req, res) => {
  const { pairing_id } = req.params;

  try {
    // 1. Fetch pairing
    const pairing = db.prepare('SELECT user_a_id, user_b_id FROM pairings WHERE id = ?').get(pairing_id);
    if (!pairing) {
      return res.status(404).json({ success: false, error: 'Pairing not found.' });
    }

    const userA = db.prepare('SELECT compass_answers FROM users WHERE id = ?').get(pairing.user_a_id);
    const userB = db.prepare('SELECT compass_answers FROM users WHERE id = ?').get(pairing.user_b_id);

    const answersA = userA && userA.compass_answers ? JSON.parse(decryptText(userA.compass_answers)) : {};
    const answersB = userB && userB.compass_answers ? JSON.parse(decryptText(userB.compass_answers)) : {};

    // 2. Overlapping accelerators
    const accA = answersA.accelerators || [];
    const accB = answersB.accelerators || [];
    const overlap = accA.filter(x => accB.includes(x));

    if (overlap.length === 0) {
      return res.json({ success: true, products: [] });
    }

    // 3. Find products matching the hashes of overlapping accelerators
    const overlappingHashes = overlap.map(tag => hashDesireTag(tag));
    const placeholders = overlappingHashes.map(() => '?').join(',');

    const query = `
      SELECT id, product_name, brand_name, rating, image_url 
      FROM affiliate_products 
      WHERE desire_tag_hash IN (${placeholders})
    `;
    const products = db.prepare(query).all(...overlappingHashes);

    // Map output to include a secure hashed redirect URL instead of direct affiliate link
    const mappedProducts = products.map(prod => ({
      id: prod.id,
      name: prod.product_name,
      brand: prod.brand_name,
      rating: prod.rating,
      imageUrl: prod.image_url,
      redirectUrl: `/api/v1/products/redirect/${prod.id}`
    }));

    res.json({ success: true, products: mappedProducts });
  } catch (error) {
    console.error('Failed to get product recommendations:', error.message);
    res.status(500).json({ success: false, error: 'Internal Server Error.' });
  }
});

// GET /api/v1/products/redirect/:product_id (Anonymized redirect switch)
router.get('/redirect/:product_id', (req, res) => {
  const { product_id } = req.params;

  try {
    const product = db.prepare('SELECT affiliate_url FROM affiliate_products WHERE id = ?').get(product_id);
    if (!product) {
      return res.status(404).send('Product not found.');
    }

    // Set headers to prevent referrer leak
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Clear-Site-Data', '"cache", "cookies"'); // Optional security measure
    res.redirect(product.affiliate_url);
  } catch (error) {
    console.error('Failed to redirect:', error.message);
    res.status(500).send('Internal Server Error.');
  }
});

module.exports = router;

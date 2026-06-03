const express = require("express");
const router = express.Router();

const {
    getMedicines,
    getMedicineById,
    saveMedicine,
    updateMedicine,
    deleteMedicine,
    restockMedicine,
    sellMedicine,
    getLowStockMedicines,
    getOutOfStockMedicines,
    getStockSummary,
    updateQuantity
} = require('../controllers/MedicineController.js')

// Basic CRUD routes
router.get('/medicines', getMedicines);
router.get('/medicines/:id', getMedicineById);
router.post('/medicines', saveMedicine);
router.patch('/medicines/:id', updateMedicine);
router.delete('/medicines/:id', deleteMedicine);

// ============ NEW QUANTITY MANAGEMENT ROUTES ============

// Stock management routes
router.patch('/medicines/:id/restock', restockMedicine);      // Add stock
router.patch('/medicines/:id/sell', sellMedicine);            // Remove stock (sell/dispense)
router.patch('/medicines/:id/quantity', updateQuantity);      // Direct quantity update

// Stock information routes
router.get('/medicines/low-stock/alerts', getLowStockMedicines);    // Get medicines with low stock (quantity < 10)
router.get('/medicines/out-of-stock', getOutOfStockMedicines);      // Get out of stock medicines (quantity = 0)
router.get('/medicines/summary/stats', getStockSummary);            // Get stock summary statistics

module.exports = router;
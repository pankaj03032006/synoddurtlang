const Medicine = require("../models/medicine.js");

const getMedicines = async (req, res) => {
    try {
        const name = req.query.name;
        let medicines = [];

        if (!name) {
            medicines = await Medicine.find({});
        } else {
            // Use regex for partial matching instead of exact match
            const nameRegex = new RegExp(name, 'i');
            medicines = await Medicine.find({ "name": nameRegex });
        }

        res.json(medicines);
    } catch (error) {
        console.error("Error in getMedicines:", error);
        res.status(500).json({ message: error.message });
    }
}

const getMedicineById = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ message: "Medicine ID is required" });
        }
        
        const medicine = await Medicine.findById(id);
        
        if (!medicine) {
            return res.status(404).json({ message: "Medicine not found" });
        }
        
        res.json(medicine);
    } catch (error) {
        console.error("Error in getMedicineById:", error);
        res.status(500).json({ message: error.message });
    }
}

const isMedicineValid = (newmedicine) => {
    let errorList = [];
    
    if (!newmedicine.company || newmedicine.company.trim() === "") {
        errorList.push("Please enter company name");
    }
    if (!newmedicine.name || newmedicine.name.trim() === "") {
        errorList.push("Please enter medicine name");
    }
    if (!newmedicine.description || newmedicine.description.trim() === "") {
        errorList.push("Please enter medicine description");
    }
    if (!newmedicine.price) {
        errorList.push("Please enter medicine cost");
    }
    if (newmedicine.price && isNaN(parseFloat(newmedicine.price))) {
        errorList.push("Medicine cost must be a valid number");
    }
    if (newmedicine.price && parseFloat(newmedicine.price) <= 0) {
        errorList.push("Medicine cost must be greater than 0");
    }
    // Add quantity validation
    if (newmedicine.quantity !== undefined && newmedicine.quantity !== null) {
        if (isNaN(parseInt(newmedicine.quantity))) {
            errorList.push("Quantity must be a valid number");
        } else if (parseInt(newmedicine.quantity) < 0) {
            errorList.push("Quantity cannot be negative");
        }
    }

    if (errorList.length > 0) {
        return {
            status: false,
            errors: errorList
        };
    }
    
    return { status: true };
}

const saveMedicine = async (req, res) => {
    let newmedicine = req.body;
    
    // Validate input
    if (!newmedicine) {
        return res.status(400).json({
            message: 'error',
            errors: ["Medicine data is required"]
        });
    }
    
    let medicineValidStatus = isMedicineValid(newmedicine);
    if (!medicineValidStatus.status) {
        return res.status(400).json({
            message: 'error',
            errors: medicineValidStatus.errors
        });
    }
    
    try {
        // Check if medicine with same name already exists
        const existingMedicine = await Medicine.findOne({ 
            name: { $regex: new RegExp(`^${newmedicine.name}$`, 'i') } 
        });
        
        if (existingMedicine) {
            return res.status(400).json({
                message: 'error',
                errors: ["Medicine with this name already exists"]
            });
        }
        
        // Create medicine with quantity
        const medicine = new Medicine({
            company: newmedicine.company,
            name: newmedicine.name,
            description: newmedicine.description,
            price: parseFloat(newmedicine.price),
            quantity: newmedicine.quantity ? parseInt(newmedicine.quantity) : 0,
            basePrice: newmedicine.basePrice ? parseFloat(newmedicine.basePrice) : parseFloat(newmedicine.price)
        });
        
        const savedMedicine = await medicine.save();
        res.status(201).json({ message: 'success', medicine: savedMedicine });
    } catch (error) {
        console.error("Error in saveMedicine:", error);
        res.status(400).json({ 
            message: 'error', 
            errors: [error.message] 
        });
    }
}

const updateMedicine = async (req, res) => {
    let newmedicine = req.body;
    const { id } = req.params;
    
    if (!id) {
        return res.status(400).json({
            message: 'error',
            errors: ["Medicine ID is required"]
        });
    }
    
    let medicineValidStatus = isMedicineValid(newmedicine);
    if (!medicineValidStatus.status) {
        return res.status(400).json({
            message: 'error',
            errors: medicineValidStatus.errors
        });
    }
    
    try {
        // Check if medicine exists
        const existingMedicine = await Medicine.findById(id);
        if (!existingMedicine) {
            return res.status(404).json({
                message: 'error',
                errors: ["Medicine not found"]
            });
        }
        
        // Check for duplicate name (excluding current medicine)
        if (newmedicine.name && newmedicine.name !== existingMedicine.name) {
            const duplicateMedicine = await Medicine.findOne({ 
                name: { $regex: new RegExp(`^${newmedicine.name}$`, 'i') },
                _id: { $ne: id }
            });
            
            if (duplicateMedicine) {
                return res.status(400).json({
                    message: 'error',
                    errors: ["Medicine with this name already exists"]
                });
            }
        }
        
        // Prepare update data with quantity
        const updateData = {
            company: newmedicine.company,
            name: newmedicine.name,
            description: newmedicine.description,
            price: parseFloat(newmedicine.price)
        };
        
        // Add quantity if provided
        if (newmedicine.quantity !== undefined && newmedicine.quantity !== null) {
            updateData.quantity = parseInt(newmedicine.quantity);
            updateData.totalValue = updateData.price * updateData.quantity;
        }
        
        // Add basePrice if provided
        if (newmedicine.basePrice) {
            updateData.basePrice = parseFloat(newmedicine.basePrice);
        }
        
        const updatedMedicine = await Medicine.updateOne(
            { _id: id }, 
            { $set: updateData }
        );
        
        if (updatedMedicine.matchedCount === 0) {
            return res.status(404).json({
                message: 'error',
                errors: ["Medicine not found"]
            });
        }
        
        res.status(200).json({ message: 'success' });
    } catch (error) {
        console.error("Error in updateMedicine:", error);
        res.status(400).json({ 
            message: 'error', 
            errors: [error.message] 
        });
    }
}

const deleteMedicine = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ message: "Medicine ID is required" });
        }
        
        // Check if medicine exists
        const medicine = await Medicine.findById(id);
        if (!medicine) {
            return res.status(404).json({ message: "Medicine not found" });
        }
        
        const deletedMedicine = await Medicine.deleteOne({ _id: id });
        
        if (deletedMedicine.deletedCount === 0) {
            return res.status(404).json({ message: "Medicine not found" });
        }
        
        res.status(200).json({ 
            message: 'success',
            deleted: deletedMedicine
        });
    } catch (error) {
        console.error("Error in deleteMedicine:", error);
        res.status(500).json({ message: error.message });
    }
}

// ============ NEW QUANTITY MANAGEMENT FUNCTIONS ============

// Restock medicine (increase quantity)
const restockMedicine = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;
        
        if (!id) {
            return res.status(400).json({ message: "Medicine ID is required" });
        }
        
        if (!quantity || quantity <= 0) {
            return res.status(400).json({ message: "Valid quantity is required" });
        }
        
        const medicine = await Medicine.findById(id);
        
        if (!medicine) {
            return res.status(404).json({ message: "Medicine not found" });
        }
        
        const newQuantity = medicine.quantity + parseInt(quantity);
        medicine.quantity = newQuantity;
        medicine.totalValue = medicine.price * newQuantity;
        await medicine.save();
        
        res.json({
            message: "Stock updated successfully",
            quantity: newQuantity,
            medicine: medicine
        });
    } catch (error) {
        console.error("Error in restockMedicine:", error);
        res.status(500).json({ message: error.message });
    }
}

// Sell/Dispense medicine (decrease quantity)
const sellMedicine = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;
        
        if (!id) {
            return res.status(400).json({ message: "Medicine ID is required" });
        }
        
        if (!quantity || quantity <= 0) {
            return res.status(400).json({ message: "Valid quantity is required" });
        }
        
        const medicine = await Medicine.findById(id);
        
        if (!medicine) {
            return res.status(404).json({ message: "Medicine not found" });
        }
        
        if (medicine.quantity < quantity) {
            return res.status(400).json({ 
                message: `Insufficient stock. Only ${medicine.quantity} units available.` 
            });
        }
        
        const newQuantity = medicine.quantity - parseInt(quantity);
        medicine.quantity = newQuantity;
        medicine.totalValue = medicine.price * newQuantity;
        await medicine.save();
        
        res.json({
            message: "Medicine dispensed successfully",
            quantity: newQuantity,
            medicine: medicine,
            totalAmount: quantity * medicine.price
        });
    } catch (error) {
        console.error("Error in sellMedicine:", error);
        res.status(500).json({ message: error.message });
    }
}

// Get low stock alerts (quantity < 10)
const getLowStockMedicines = async (req, res) => {
    try {
        const lowStockMedicines = await Medicine.find({ quantity: { $lt: 10 } }).sort({ quantity: 1 });
        res.json(lowStockMedicines);
    } catch (error) {
        console.error("Error in getLowStockMedicines:", error);
        res.status(500).json({ message: error.message });
    }
}

// Get out of stock medicines (quantity = 0)
const getOutOfStockMedicines = async (req, res) => {
    try {
        const outOfStockMedicines = await Medicine.find({ quantity: 0 });
        res.json(outOfStockMedicines);
    } catch (error) {
        console.error("Error in getOutOfStockMedicines:", error);
        res.status(500).json({ message: error.message });
    }
}

// Get stock summary statistics
const getStockSummary = async (req, res) => {
    try {
        const totalMedicines = await Medicine.countDocuments();
        const totalUnits = await Medicine.aggregate([
            { $group: { _id: null, total: { $sum: "$quantity" } } }
        ]);
        const totalValue = await Medicine.aggregate([
            { $group: { _id: null, total: { $sum: { $multiply: ["$price", "$quantity"] } } } }
        ]);
        const lowStock = await Medicine.countDocuments({ quantity: { $lt: 10, $gt: 0 } });
        const outOfStock = await Medicine.countDocuments({ quantity: 0 });
        const wellStocked = await Medicine.countDocuments({ quantity: { $gte: 50 } });
        
        res.json({
            totalMedicines,
            totalUnits: totalUnits[0]?.total || 0,
            totalValue: totalValue[0]?.total || 0,
            lowStock,
            outOfStock,
            wellStocked
        });
    } catch (error) {
        console.error("Error in getStockSummary:", error);
        res.status(500).json({ message: error.message });
    }
}

// Update quantity directly
const updateQuantity = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;
        
        if (!id) {
            return res.status(400).json({ message: "Medicine ID is required" });
        }
        
        if (quantity === undefined || quantity === null) {
            return res.status(400).json({ message: "Quantity is required" });
        }
        
        if (parseInt(quantity) < 0) {
            return res.status(400).json({ message: "Quantity cannot be negative" });
        }
        
        const medicine = await Medicine.findById(id);
        
        if (!medicine) {
            return res.status(404).json({ message: "Medicine not found" });
        }
        
        medicine.quantity = parseInt(quantity);
        medicine.totalValue = medicine.price * medicine.quantity;
        await medicine.save();
        
        res.json({
            message: "Quantity updated successfully",
            quantity: medicine.quantity,
            medicine: medicine
        });
    } catch (error) {
        console.error("Error in updateQuantity:", error);
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
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
};
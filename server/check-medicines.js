// server/check-medicines.js
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.set('strictQuery', false);

const medicineSchema = new mongoose.Schema({
    name: String,
    company: String,
    price: Number,
    quantity: Number,
    basePrice: Number,
    description: String
});

const Medicine = mongoose.model('Medicine', medicineSchema);

async function checkMedicines() {
    try {
        await mongoose.connect('mongodb://localhost:27017/hospital');
        console.log('Connected to MongoDB\n');
        
        // Get all medicines
        const medicines = await Medicine.find();
        
        console.log(`Total medicines found: ${medicines.length}\n`);
        
        if (medicines.length === 0) {
            console.log('No medicines found in database!');
            process.exit(0);
        }
        
        // Check each medicine
        medicines.forEach((medicine, index) => {
            console.log(`Medicine ${index + 1}:`);
            console.log(`  ID: ${medicine._id}`);
            console.log(`  Name: ${medicine.name}`);
            console.log(`  Company: ${medicine.company}`);
            console.log(`  Price: ${medicine.price}`);
            console.log(`  Quantity: ${medicine.quantity === undefined ? 'NOT SET' : medicine.quantity}`);
            console.log(`  Base Price: ${medicine.basePrice === undefined ? 'NOT SET' : medicine.basePrice}`);
            console.log(`  Has quantity field: ${medicine.quantity !== undefined ? 'YES' : 'NO'}`);
            console.log('---');
        });
        
        await mongoose.disconnect();
        
    } catch (error) {
        console.error('Error:', error);
    }
    process.exit(0);
}

checkMedicines();
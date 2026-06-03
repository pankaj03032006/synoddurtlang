// server/fix-quantity.js
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.set('strictQuery', false);

// Your medicine schema
const medicineSchema = new mongoose.Schema({
    name: String,
    company: String,
    price: Number,
    quantity: Number,
    basePrice: Number,
    description: String
}, { strict: false });

const Medicine = mongoose.model('Medicine', medicineSchema);

async function fixQuantity() {
    try {
        const mongoURI = process.env.MONGO_URI;
        
        console.log('Connecting to MongoDB Atlas...');
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000
        });
        
        console.log('✅ Connected to MongoDB Atlas successfully!\n');
        
        // Get all medicines
        const medicines = await Medicine.find();
        console.log(`📊 Found ${medicines.length} medicines in database\n`);
        
        if (medicines.length === 0) {
            console.log('No medicines found in the database.');
            await mongoose.disconnect();
            process.exit(0);
        }
        
        // Show current medicines
        console.log('Current medicines:');
        medicines.forEach((med, i) => {
            console.log(`${i+1}. ${med.name} - ${med.company}`);
            console.log(`   Price: ₹${med.price}, Quantity: ${med.quantity || 'NOT SET'}`);
        });
        
        console.log('\n🔄 Updating medicines with quantity field...');
        
        // Fix: Update each medicine individually to avoid the cast error
        let updatedCount = 0;
        
        for (const medicine of medicines) {
            const updateData = {
                quantity: 50,
                basePrice: medicine.price || 100
            };
            
            const result = await Medicine.updateOne(
                { _id: medicine._id },
                { $set: updateData }
            );
            
            if (result.modifiedCount > 0) {
                updatedCount++;
            }
        }
        
        console.log(`✅ Updated ${updatedCount} out of ${medicines.length} medicines\n`);
        
        // Verify the update
        const updatedMedicines = await Medicine.find();
        console.log('📋 Updated medicines:');
        updatedMedicines.forEach((med, i) => {
            console.log(`${i+1}. ${med.name}`);
            console.log(`   Quantity: ${med.quantity}, Base Price: ₹${med.basePrice || med.price}`);
            console.log(`   Selling Price: ₹${med.price}\n`);
        });
        
        await mongoose.disconnect();
        console.log('✅ Script completed successfully!');
        console.log('💡 Refresh your Medicine List page - "Out of Stock" will be gone!');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
    process.exit(0);
}

fixQuantity();
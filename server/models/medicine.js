const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const bcrypt = require('bcrypt')
var uniqueValidator = require('mongoose-unique-validator')

const MedicineSchema = new Schema({
    company: {
        type: String,
        required: [true, 'Please provide company']
    },
    name: {
        type: String,
        required: [true, 'Please provide name']
    },
    description: {
        type: String,
        required: [true, 'Please provide description']
    },
    price: {
        type: Number,
        required: [true, 'Please provide medicine cost']
    },
    // ADD THESE NEW FIELDS FOR DYNAMIC QUANTITY
    quantity: {
        type: Number,
        required: [true, 'Please provide quantity'],
        default: 0,
        min: [0, 'Quantity cannot be negative']
    },
    basePrice: {
        type: Number,
        default: function() {
            return this.price;
        }
    },
    totalValue: {
        type: Number,
        default: 0
    },
    lowStockThreshold: {
        type: Number,
        default: 10
    }
},
    {
        timestamps: true
    });

// Calculate total value before saving
MedicineSchema.pre('save', function(next) {
    this.totalValue = this.price * this.quantity;
    next();
});

// Method to reduce quantity when selling
MedicineSchema.methods.reduceQuantity = async function(amount) {
    if (this.quantity < amount) {
        throw new Error(`Insufficient stock. Only ${this.quantity} units available.`);
    }
    this.quantity -= amount;
    this.totalValue = this.price * this.quantity;
    await this.save();
    return this.quantity;
};

// Method to increase quantity when restocking
MedicineSchema.methods.increaseQuantity = async function(amount) {
    this.quantity += amount;
    this.totalValue = this.price * this.quantity;
    await this.save();
    return this.quantity;
};

// Virtual property to check if stock is low
MedicineSchema.virtual('isLowStock').get(function() {
    return this.quantity <= this.lowStockThreshold;
});

// Virtual property to get stock status
MedicineSchema.virtual('stockStatus').get(function() {
    if (this.quantity === 0) return 'Out of Stock';
    if (this.quantity <= this.lowStockThreshold) return 'Low Stock';
    if (this.quantity <= 50) return 'In Stock';
    return 'Well Stocked';
});

MedicineSchema.plugin(uniqueValidator);

const Medicine = mongoose.model('Medicine', MedicineSchema);

module.exports = Medicine;
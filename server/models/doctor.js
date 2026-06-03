const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

const DoctorSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, 'User ID is required']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number']
  },
  department: {
    type: String,
    trim: true,
    required: [true, 'Department is required']
  },
  address: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for better query performance
DoctorSchema.index({ userId: 1 });
DoctorSchema.index({ department: 1 });

// Virtual for full name (will be populated from User)
DoctorSchema.virtual('fullName').get(function() {
  return this.userId ? `${this.userId.firstName} ${this.userId.lastName}` : '';
});

// Virtual for email (will be populated from User)
DoctorSchema.virtual('email').get(function() {
  return this.userId ? this.userId.email : '';
});

// Static method to find doctors by department
DoctorSchema.statics.findByDepartment = function(department) {
  return this.find({ department: department }).populate('userId');
};

// Static method to find doctor by user ID
DoctorSchema.statics.findByUserId = function(userId) {
  return this.findOne({ userId: userId }).populate('userId');
};

// Method to get doctor's full details
DoctorSchema.methods.getFullDetails = function() {
  return {
    id: this._id,
    userId: this.userId,
    phone: this.phone,
    department: this.department,
    address: this.address,
    fullName: this.fullName,
    email: this.email
  };
};

const Doctor = mongoose.model("Doctor", DoctorSchema);

module.exports = Doctor;
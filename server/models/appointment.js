const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
var uniqueValidator = require('mongoose-unique-validator');

const AppointmentSchema = new Schema({
  appointmentDate: {
    type: Date,
    required: [true, 'Please provide appointment date']
  },
  appointmentTime: {
    type: String,
    required: [true, 'Please provide appointment time']
  },
  isTimeSlotAvailable: {
    type: Boolean,
    default: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    default: null
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: [true, 'Please provide doctor ID']
  },
  completed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
AppointmentSchema.index({ appointmentDate: 1, doctorId: 1, isTimeSlotAvailable: 1 });
AppointmentSchema.index({ doctorId: 1, appointmentDate: 1 });
AppointmentSchema.index({ patientId: 1, completed: 1 });
AppointmentSchema.index({ isTimeSlotAvailable: 1, appointmentDate: 1 });

// Add virtual for formatted date
AppointmentSchema.virtual('formattedDate').get(function() {
  return this.appointmentDate ? this.appointmentDate.toLocaleDateString() : null;
});

// Add virtual for formatted time
AppointmentSchema.virtual('formattedTime').get(function() {
  return this.appointmentTime;
});

// Add method to check if appointment is bookable
AppointmentSchema.methods.isBookable = function() {
  return this.isTimeSlotAvailable === true && this.completed === false;
};

// Add static method to find available slots by date and doctor
AppointmentSchema.statics.findAvailableSlots = function(date, doctorId) {
  return this.find({
    appointmentDate: date,
    doctorId: doctorId,
    isTimeSlotAvailable: true
  }).sort({ appointmentTime: 1 });
};

// Add static method to find booked appointments by patient
AppointmentSchema.statics.findByPatient = function(patientId) {
  return this.find({
    patientId: patientId,
    isTimeSlotAvailable: false
  }).populate('doctorId').sort({ appointmentDate: -1 });
};

// Add static method to find appointments by doctor
AppointmentSchema.statics.findByDoctor = function(doctorId, date = null) {
  const query = { doctorId: doctorId };
  if (date) {
    query.appointmentDate = date;
  }
  return this.find(query).populate('patientId').sort({ appointmentDate: -1, appointmentTime: 1 });
};

// Pre-save middleware to validate appointment time format
AppointmentSchema.pre('save', function(next) {
  // Check if appointmentTime is in valid format (HH:MM AM/PM or 24-hour format)
  const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$|^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(this.appointmentTime)) {
    next(new Error('Invalid appointment time format'));
  }
  next();
});

// Pre-validate middleware to ensure doctorId is provided when booking
AppointmentSchema.pre('validate', function(next) {
  if (!this.isTimeSlotAvailable && !this.patientId) {
    next(new Error('Patient ID is required when booking an appointment'));
  }
  next();
});

const Appointment = mongoose.model('Appointment', AppointmentSchema);

module.exports = Appointment;
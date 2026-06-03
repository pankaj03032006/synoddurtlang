const User = require("../models/user.js");
const Appointment = require("../models/appointment.js");
const Prescription = require("../models/prescription.js");
const mongoose = require("mongoose");

var moment = require('moment');

const getUserCountByRole = async (req, res) => {
    try {
        var userType = req.body.userType;
        
        if (!userType) {
            return res.status(400).json({ errors: ["User type is missing in body"] });
        }
        
        const users = await User.find({ "userType": userType });
        res.json({ 'count': users.length });
        
    } catch (error) {
        console.error("Error in getUserCountByRole:", error);
        res.status(500).json({ errors: [error.message] });
    }
}

const getAppointmentCount = async (req, res) => {
    try {
        let query = {
            "appointmentDate": moment(new Date()).format('YYYY-MM-DD'),
            'isTimeSlotAvailable': false,
        };
        
        if (req.sender && req.sender.doctorId) {
            query.doctorId = req.sender.doctorId;
        }
        
        if (req.sender && req.sender.patientId) {
            query.patientId = req.sender.patientId;
        }
        
        const appointmentsToday = await Appointment.find(query);
        
        const pendingAppointmentsToday = await Appointment.find({
            ...query,
            "completed": false
        });
        
        res.json({
            "message": "success",
            'totalAppointments': appointmentsToday.length,
            "pendingAppointments": pendingAppointmentsToday.length,
        });
        
    } catch (error) {
        console.error("Error in getAppointmentCount:", error);
        res.status(500).json({ errors: [error.message] });
    }
}

const getPatientsTreatedCount = async (req, res) => {
    try {
        // Check if doctorId exists in sender
        if (!req.sender || !req.sender.doctorId) {
            return res.status(400).json({ 
                errors: ["Doctor ID is missing or invalid"] 
            });
        }
        
        const prescriptions = await Prescription.find({})
            .populate({
                path: 'appointmentId',
                populate: {
                    path: 'doctorId',
                    match: { _id: mongoose.Types.ObjectId(req.sender.doctorId) }
                }
            })
            .then((prescriptions) => 
                prescriptions.filter(pre => pre.appointmentId && pre.appointmentId.doctorId != null)
            );
        
        res.json({
            "message": "success",
            'treatedPatients': prescriptions.length
        });
        
    } catch (error) {
        console.error("Error in getPatientsTreatedCount:", error);
        res.status(500).json({ errors: [error.message] });
    }
}

module.exports = {
    getUserCountByRole,
    getAppointmentCount,
    getPatientsTreatedCount
};
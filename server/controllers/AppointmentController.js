const Appointment = require("../models/appointment.js");
const Doctor = require("../models/doctor.js");
const Patient = require("../models/patient.js");
const mongoose = require("mongoose");

const getDepartments = async (req, res) => {
    try {
        let departmentList = await Doctor.distinct("department");
        res.json({ message: "success", 'departments': departmentList });
    } catch (error) {
        console.error("Error in getDepartments:", error);
        res.status(500).json({ errors: [error.message] });
    }
}

const getAppointments = async (req, res) => {
    try {
        let isTimeSlotAvailable = req.body.isTimeSlotAvailable;
        let appointmentDate = req.body.appDate ? new Date(req.body.appDate).toISOString().slice(0, 10) : null;
        let docID = req.body.doctorID;
        let appointments = [];
        
        if (isTimeSlotAvailable) {
            if (docID) {
                appointments = await Appointment.find({
                    'isTimeSlotAvailable': isTimeSlotAvailable,
                    'appointmentDate': appointmentDate,
                    'doctorId': mongoose.Types.ObjectId(docID)
                });
            } else if (req.sender && req.sender.userType === "Doctor") {
                appointments = await Appointment.find({
                    'isTimeSlotAvailable': isTimeSlotAvailable,
                    'appointmentDate': appointmentDate,
                    'doctorId': req.sender.doctorId
                }).populate({
                    path: 'doctorId',
                    populate: {
                        path: 'userId'
                    }
                }).populate({
                    path: 'patientId',
                    populate: {
                        path: 'userId'
                    }
                });
            }
        } else if (isTimeSlotAvailable === false) {
            if (req.sender && req.sender.userType === "Admin") {
                let query = {
                    'isTimeSlotAvailable': false,
                    'appointmentDate': appointmentDate,
                    "completed": false
                };
                if (docID) {
                    query.doctorId = mongoose.Types.ObjectId(docID);
                }
                
                appointments = await Appointment.find(query)
                    .populate({
                        path: 'doctorId',
                        populate: {
                            path: 'userId'
                        }
                    })
                    .populate({
                        path: 'patientId',
                        populate: {
                            path: 'userId'
                        }
                    });
            } else if (req.sender && req.sender.userType === "Patient") {
                let query = {
                    'isTimeSlotAvailable': false,
                    'completed': false,
                    'patientId': req.sender.patientId
                };
                
                if (docID) {
                    query.doctorId = mongoose.Types.ObjectId(docID);
                }
                if (appointmentDate) {
                    query.appointmentDate = appointmentDate;
                }
                
                appointments = await Appointment.find(query)
                    .populate({
                        path: 'doctorId',
                        populate: {
                            path: 'userId'
                        }
                    })
                    .populate({
                        path: 'patientId',
                        populate: {
                            path: 'userId'
                        }
                    });
            } else if (req.sender && req.sender.userType === "Doctor") {
                appointments = await Appointment.find({
                    'isTimeSlotAvailable': false,
                    'completed': false,
                    'appointmentDate': appointmentDate,
                    'doctorId': req.sender.doctorId
                }).populate({
                    path: 'doctorId',
                    populate: {
                        path: 'userId'
                    }
                }).populate({
                    path: 'patientId',
                    populate: {
                        path: 'userId'
                    }
                });
            }
        }
        
        res.json({ message: "success", 'appointments': appointments });
    } catch (error) {
        console.error("Error in getAppointments:", error);
        res.status(500).json({ errors: [error.message] });
    }
}

const createAppointmentSlot = async (req, res) => {
    try {
        let appDate = new Date(req.body.appDate).toISOString().slice(0, 10);
        let timeSlots = req.body.timeSlots;
        let docID = req.body.doctorID;
        
        if (!timeSlots || !Array.isArray(timeSlots) || timeSlots.length === 0) {
            return res.status(400).json({ errors: ["No time slots provided"] });
        }
        
        if (!docID) {
            return res.status(400).json({ errors: ["Doctor ID is required"] });
        }
        
        for (let slot of timeSlots) {
            let app = await Appointment.find({
                'appointmentDate': appDate,
                'appointmentTime': slot,
                'doctorId': docID
            });
            
            if (!(app.length > 0)) {
                await Appointment.create({
                    'appointmentDate': appDate,
                    'appointmentTime': slot,
                    'doctorId': docID
                });
            }
        }
        
        res.json({ message: "success" });
    } catch (error) {
        console.error("Error in createAppointmentSlot:", error);
        res.status(500).json({ errors: [error.message] });
    }
}

const bookAppointment = async (req, res) => {
    try {
        const { appDate, appTime, doctorId, patientId } = req.body;
        
        if (!appDate || !appTime || !doctorId || !patientId) {
            return res.status(400).json({ 
                errors: ["Missing required fields: appDate, appTime, doctorId, patientId"] 
            });
        }
        
        let appointment = await Appointment.findOneAndUpdate({
            'isTimeSlotAvailable': true,
            'appointmentDate': appDate,
            'appointmentTime': appTime,
            'doctorId': mongoose.Types.ObjectId(doctorId)
        }, {
            'isTimeSlotAvailable': false,
            'patientId': mongoose.Types.ObjectId(patientId)
        }, { new: true });
        
        if (appointment) {
            res.json({ message: "success" });
        } else {
            res.status(404).json({ errors: ["Could not book appointment. Please try again."] });
        }
    } catch (error) {
        console.error("Error in bookAppointment:", error);
        res.status(500).json({ errors: [error.message] });
    }
}

const deleteAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        
        if (!appointmentId) {
            return res.status(400).json({ errors: ["Appointment ID is required"] });
        }
        
        let appointment = await Appointment.findByIdAndDelete(appointmentId);
        
        if (appointment) {
            res.json({ message: "success" });
        } else {
            res.status(404).json({ errors: ["Could not delete appointment"] });
        }
    } catch (error) {
        console.error("Error in deleteAppointment:", error);
        res.status(500).json({ errors: [error.message] });
    }
}

const getAppointmentById = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ errors: ["Appointment ID is required"] });
        }
        
        const appointment = await Appointment.findById(id).lean();
        
        if (!appointment) {
            return res.status(404).json({ errors: ["Appointment not found"] });
        }
        
        if (appointment.doctorId) {
            appointment.doctorDetails = await Doctor.findById(appointment.doctorId);
        }
        if (appointment.patientId) {
            appointment.patientDetails = await Patient.findById(appointment.patientId);
        }
        
        res.json({ message: "success", "appointment": appointment });
    } catch (error) {
        console.error("Error in getAppointmentById:", error);
        res.status(500).json({ errors: [error.message] });
    }
}

const updateAppointmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const { appDate, appTime, doctorId, patientId } = req.body;
        
        if (!id) {
            return res.status(400).json({ errors: ["Appointment ID is required"] });
        }
        
        const appointment = await Appointment.findByIdAndUpdate(
            id,
            {
                'isTimeSlotAvailable': false,
                'appointmentDate': appDate,
                'appointmentTime': appTime,
                'doctorId': mongoose.Types.ObjectId(doctorId),
                'patientId': mongoose.Types.ObjectId(patientId)
            },
            { new: true }
        );
        
        if (appointment) {
            // Delete the open slot if it exists
            await Appointment.findOneAndDelete({
                'isTimeSlotAvailable': true,
                'appointmentDate': appDate,
                'appointmentTime': appTime,
            });
            res.json({ message: "success" });
        } else {
            res.status(404).json({ errors: ["Could not update appointment"] });
        }
    } catch (error) {
        console.error("Error in updateAppointmentById:", error);
        res.status(500).json({ errors: [error.message] });
    }
}

module.exports = {
    getDepartments,
    getAppointments,
    getAppointmentById,
    createAppointmentSlot,
    bookAppointment,
    deleteAppointment,
    updateAppointmentById
};
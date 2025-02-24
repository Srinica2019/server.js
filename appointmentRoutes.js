const express = require("express");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const moment = require("moment");
const router = express.Router();

// Fetch all appointments
router.get("/", async (req, res) => {
  try {
    const appointments = await Appointment.find().populate("doctorId");
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create appointment with slot validation
router.post("/", async (req, res) => {
  try {
    const { doctorId, date, duration, appointmentType, patientName, notes } = req.body;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    
    const appointmentStart = moment(date);
    const appointmentEnd = moment(date).add(duration, "minutes");
    
    const existingAppointments = await Appointment.find({ doctorId, date: { $gte: appointmentStart.toDate(), $lt: appointmentEnd.toDate() } });
    if (existingAppointments.length > 0) return res.status(400).json({ message: "Time slot already booked" });

    const newAppointment = new Appointment({ doctorId, date, duration, appointmentType, patientName, notes });
    await newAppointment.save();
    res.status(201).json(newAppointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update appointment
router.put("/:id", async (req, res) => {
  try {
    const { date, duration } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    const appointmentStart = moment(date);
    const appointmentEnd = moment(date).add(duration, "minutes");

    const existingAppointments = await Appointment.find({
      doctorId: appointment.doctorId,
      _id: { $ne: appointment._id },
      date: { $gte: appointmentStart.toDate(), $lt: appointmentEnd.toDate() },
    });

    if (existingAppointments.length > 0) return res.status(400).json({ message: "Time slot already booked" });

    Object.assign(appointment, req.body);
    await appointment.save();
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete appointment
router.delete("/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    res.json({ message: "Appointment deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

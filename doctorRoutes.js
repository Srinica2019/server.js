const express = require("express");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const router = express.Router();
const moment = require("moment");

router.get("/", async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id/slots", async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;
    const doctor = await Doctor.findById(id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const start = moment(date + " " + doctor.workingHours.start, "YYYY-MM-DD HH:mm");
    const end = moment(date + " " + doctor.workingHours.end, "YYYY-MM-DD HH:mm");
    const existingAppointments = await Appointment.find({ doctorId: id, date: { $gte: start.toDate(), $lt: end.toDate() } });
    
    let slots = [];
    let currentTime = start;
    while (currentTime < end) {
      const isBooked = existingAppointments.some(app => moment(app.date).isSame(currentTime));
      if (!isBooked) slots.push(currentTime.format("HH:mm"));
      currentTime.add(30, "minutes");
    }

    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
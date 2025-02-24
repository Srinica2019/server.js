const mongoose = require("mongoose");

const DoctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  workingHours: {
    start: { type: String, required: true },
    end: { type: String, required: true }
  }
});

module.exports = mongoose.model("Doctor", DoctorSchema);
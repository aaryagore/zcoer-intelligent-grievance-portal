const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  zprn: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true }
});

module.exports = mongoose.models.Student || mongoose.model("Student", studentSchema);

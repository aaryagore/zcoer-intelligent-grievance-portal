import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema({
  staffId: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  assignedCategory: { type: String, required: true }
});

export default mongoose.models.Staff || mongoose.model("Staff", staffSchema);

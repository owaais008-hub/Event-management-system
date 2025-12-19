import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    attended: { type: Boolean, default: false },
    markedOn: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

attendanceSchema.index({ eventId: 1, studentId: 1 }, { unique: true });

export const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
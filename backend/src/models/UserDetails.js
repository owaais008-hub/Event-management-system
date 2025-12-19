import mongoose from 'mongoose';

const userDetailsSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fullName: { type: String, required: true, trim: true },
    mobileNumber: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    enrollmentNo: { type: String, required: true, unique: true, trim: true },
    profilePic: { type: String }
  },
  { timestamps: true }
);

export const UserDetails = mongoose.model('UserDetails', userDetailsSchema);
export default UserDetails;
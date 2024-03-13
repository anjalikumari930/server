// Import mongoose
import mongoose from 'mongoose';

// Define the customer schema
const customerSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  contactName: {
    type: String,
    required: true,
  },
  contactTitle: {
    type: String,
    required: true,
  },
  region: {
    type: String,
    required: true,
  },
  postalCode: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
},
{ timestamps: true }
);

export default mongoose.model("Customer", customerSchema);

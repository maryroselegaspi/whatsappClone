import mongoose from'mongoose';

// Define data schema
const whatsappSchema = mongoose.Schema({
    message: String ,
    name: String,
    timestamp: String,
    received: Boolean
});

export default mongoose.model('messagecontents', whatsappSchema)

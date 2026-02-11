import mongoose from 'mongoose';

const statusSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    fileId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true, // GridFS file _id
    },

    viewers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],

    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400, // 🔥 AUTO DELETE AFTER 24 HOURS
    },
});

export default mongoose.models.Status ||
    mongoose.model('Status', statusSchema);

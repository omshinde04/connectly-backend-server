import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema(
    {
        users: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
        ],
        lastMessage: {
            type: String,
        },
    },
    { timestamps: true }
);

export default mongoose.models.Chat ||
    mongoose.model('Chat', ChatSchema);

import connectDB from '../../../lib/db';
import Message from '../../../models/Message';
import Chat from '../../../models/Chat';
import authenticate from '../../../middleware/auth';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const user = await authenticate(req);
        await connectDB();

        const { chatId, text } = req.body;

        if (!chatId || !text) {
            return res
                .status(400)
                .json({ message: 'chatId and text are required' });
        }

        const chat = await Chat.findOne({
            _id: chatId,
            users: user._id,
        });

        if (!chat) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // when message is created
        const message = await Message.create({
            chat: chatId,
            sender: user._id,
            text,
            readBy: [user._id],       // sender read
            deliveredTo: [user._id],  // sender delivered to self
        });


        // ✅ UPDATE CHAT TIMESTAMP
        chat.updatedAt = new Date();
        await chat.save();

        // ✅ POPULATE FOR UI
        const populatedMessage = await Message.findById(message._id)
            .populate('sender', '_id name')
            .lean();

        // ✅ SINGLE RESPONSE ONLY
        res.status(201).json(populatedMessage);

    } catch (error) {
        console.error('SEND MESSAGE ERROR 👉', error);
        res.status(500).json({ message: 'Server error' });
    }
}

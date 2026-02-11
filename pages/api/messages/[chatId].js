import connectDB from '../../../lib/db';
import Message from '../../../models/Message';
import authenticate from '../../../middleware/auth';
import mongoose from 'mongoose';

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store, max-age=0');

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const user = await authenticate(req);
        await connectDB();

        const { chatId } = req.query;

        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            return res.status(400).json({ message: 'Invalid chatId' });
        }

        const messages = await Message.find({ chat: chatId })
            .sort({ createdAt: 1 })
            .populate('sender', '_id name')
            .lean();

        res.status(200).json({ messages });
    } catch (error) {
        console.error('GET MESSAGES ERROR 👉', error);
        res.status(401).json({ message: 'Unauthorized' });
    }
}

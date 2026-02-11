import connectDB from '../../../lib/db';
import Message from '../../../models/Message';
import authenticate from '../../../middleware/auth';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const user = await authenticate(req);
        await connectDB();

        const { chatId } = req.body;

        if (!chatId) {
            return res.status(400).json({ message: 'chatId required' });
        }

        // ✅ Mark unread messages as read
        await Message.updateMany(
            {
                chat: chatId,
                sender: { $ne: user._id },
                readBy: { $ne: user._id },
            },
            {
                $addToSet: { readBy: user._id },
            }
        );

        res.status(200).json({ success: true });
    } catch (err) {
        console.error('READ ERROR 👉', err);
        res.status(500).json({ message: 'Server error' });
    }
}

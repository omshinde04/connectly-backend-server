import connectDB from '../../../lib/db';
import Chat from '../../../models/Chat';
import Message from '../../../models/Message';
import authenticate from '../../../middleware/auth';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const user = await authenticate(req);
        await connectDB();

        const chats = await Chat.find({
            users: user._id,
        })
            .sort({ updatedAt: -1 })
            .populate('users', 'name email')
            .lean();

        const result = await Promise.all(
            chats.map(async (chat) => {
                // 🔹 last message
                const lastMessage = await Message.findOne({
                    chat: chat._id,
                })
                    .sort({ createdAt: -1 })
                    .lean();

                // 🔹 unread count (🔥 core logic)
                const unreadCount = await Message.countDocuments({
                    chat: chat._id,
                    sender: { $ne: user._id },
                    readBy: { $ne: user._id },
                });

                // 🔹 other user
                const otherUser = chat.users.find(
                    (u) => u._id.toString() !== user._id.toString()
                );

                return {
                    _id: chat._id,
                    otherUser,
                    lastMessage,
                    unreadCount,        // 🔥 ADD THIS
                    updatedAt: chat.updatedAt,
                };
            })
        );

        res.status(200).json(result);
    } catch (error) {
        console.error('GET CHATS ERROR:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

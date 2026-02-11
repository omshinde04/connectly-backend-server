import connectDB from '../../../lib/db';
import Chat from '../../../models/Chat';
import authenticate from '../../../middleware/auth';
import mongoose from 'mongoose';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // 🔐 MUST await authentication
        const user = await authenticate(req);

        await connectDB();

        const { receiverId } = req.body;
        const senderId = user._id.toString();

        if (!receiverId) {
            return res.status(400).json({ message: 'receiverId required' });
        }

        if (receiverId === senderId) {
            return res.status(400).json({
                message: 'Cannot create chat with yourself',
            });
        }

        // 🔍 Check if chat already exists
        const existingChat = await Chat.findOne({
            users: {
                $all: [
                    new mongoose.Types.ObjectId(senderId),
                    new mongoose.Types.ObjectId(receiverId),
                ],
            },
        });

        if (existingChat) {
            return res.status(200).json(existingChat);
        }

        // 🆕 Create new chat
        const chat = await Chat.create({
            users: [
                new mongoose.Types.ObjectId(senderId),
                new mongoose.Types.ObjectId(receiverId),
            ],
        });

        res.status(201).json(chat);
    } catch (error) {
        console.error('CREATE CHAT ERROR 👉', error);
        res.status(401).json({ message: 'Unauthorized' });
    }
}

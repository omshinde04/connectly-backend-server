// lib/socket.js
import { Server } from 'socket.io';

let io;

export function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: '*',
        },
    });

    io.on('connection', (socket) => {
        console.log('🟢 Socket connected:', socket.id);

        socket.on('join-user', (userId) => {
            socket.join(userId);
            console.log('👤 User joined room:', userId);
        });

        socket.on('join-chat', (chatId) => {
            socket.join(chatId);
            console.log('💬 Joined chat:', chatId);
        });

        socket.on('disconnect', () => {
            console.log('🔴 Socket disconnected:', socket.id);
        });
    });

    return io;
}

export function getIO() {
    if (!io) throw new Error('Socket not initialized');
    return io;
}

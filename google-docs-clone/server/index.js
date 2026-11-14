import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

import Connection from './database/db.js';
import { getDocument, updateDocument } from './controller/document-controller.js';
import authRoutes from './routes/auth.js';
import docRoutes from './routes/docs.js';

dotenv.config();

const PORT = process.env.PORT || 9000;

Connection();

const app = express();

// Allowed origins: localhost (dev) + Railway / Vercel production
const isAllowedOrigin = (origin) => {
    if (!origin) return true; // same-origin or server-to-server
    const patterns = [
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/,   // local dev
        /^https:\/\/.*\.railway\.app$/,                   // Railway deployments
        /^https:\/\/.*\.up\.railway\.app$/,               // Railway public domains
        /^https:\/\/.*\.vercel\.app$/,                    // Vercel (optional)
    ];
    // Also allow explicit CLIENT_ORIGIN env var (set in Railway dashboard)
    if (process.env.CLIENT_ORIGIN && origin === process.env.CLIENT_ORIGIN) return true;
    return patterns.some(r => r.test(origin));
};

const corsOptions = {
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) callback(null, true);
        else callback(new Error('Not allowed by CORS'));
    },
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Health-check endpoint (Railway uses this to verify the service is up)
app.get('/health', (_, res) => res.json({ status: 'ok' }));

// Define Routes
app.use('/api/auth', authRoutes);
app.use('/api/docs', docRoutes);

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
    origin: (origin, callback) => {
        const allowed = [
            /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/,
            /^https:\/\/.*\.vercel\.app$/,          // all Vercel previews
            /^https:\/\/your-custom-domain\.com$/,  // optional custom domain
        ];
        if (!origin || allowed.some(r => r.test(origin))) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    // Allow polling fallback for environments that block WebSocket upgrades
    transports: ['websocket', 'polling'],
});

const documentUsers = new Map(); // documentId -> Map(socketId -> userInfo)

const userColors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6'];

io.on('connection', socket => {
    let currentDocId = null;

    socket.on('get-document', async (documentId, userInfo) => {
        currentDocId = documentId;
        const document = await getDocument(documentId);
        if (!document) return;

        socket.join(documentId);
        socket.emit('load-document', document.data);

        // Track active collaborator in this document room
        if (!documentUsers.has(documentId)) {
            documentUsers.set(documentId, new Map());
        }
        const roomMap = documentUsers.get(documentId);
        const color = userColors[roomMap.size % userColors.length];
        const user = {
            socketId: socket.id,
            name: (userInfo && userInfo.name) ? userInfo.name : 'Anonymous Editor',
            color: (userInfo && userInfo.color) ? userInfo.color : color,
            online: true
        };
        roomMap.set(socket.id, user);

        // Broadcast current active collaborators to everyone in room
        io.to(documentId).emit('active-users', Array.from(roomMap.values()));

        socket.on('send-changes', delta => {
            socket.broadcast.to(documentId).emit('receive-changes', delta);
        });

        socket.on('save-document', async data => {
            await updateDocument(documentId, data);
        });

        socket.on('update-title', newTitle => {
            socket.broadcast.to(documentId).emit('receive-title', newTitle);
        });
    });

    socket.on('disconnect', () => {
        if (currentDocId && documentUsers.has(currentDocId)) {
            const roomMap = documentUsers.get(currentDocId);
            roomMap.delete(socket.id);
            if (roomMap.size === 0) {
                documentUsers.delete(currentDocId);
            } else {
                io.to(currentDocId).emit('active-users', Array.from(roomMap.values()));
            }
        }
    });
});

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));

process.on('SIGINT', () => {
    httpServer.close(() => process.exit(0));
});
process.on('SIGTERM', () => {
    httpServer.close(() => process.exit(0));
});

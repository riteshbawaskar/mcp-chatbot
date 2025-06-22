import Fastify from 'fastify';
import projectRoutes from './routes/projects.js';
import chatRoutes from './routes/chat.js';
import cors from '@fastify/cors';
const server = Fastify({ logger: true });
server.register(cors, {
    origin: '*', // Allow all origins for simplicity; adjust as needed
});
server.register(projectRoutes, { prefix: '/projects' });
server.register(chatRoutes, { prefix: '/chat' });
server.listen({ port: 3000 }, err => {
    if (err)
        throw err;
    console.log('Server running on http://localhost:3000');
});

import { interpretPrompt } from '../services/openrouter.js';
const chatRoutes = async (fastify) => {
    fastify.post('/', async (request, reply) => {
        const { message } = request.body;
        const response = await interpretPrompt(message);
        return { response };
    });
};
export default chatRoutes;

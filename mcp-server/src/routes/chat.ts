import { FastifyPluginAsync } from 'fastify';
import { interpretPrompt } from '../services/openrouter.js';

const chatRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/', async (request, reply) => {
    const { message } = request.body as { message: string };
    const response = await interpretPrompt(message);
    return { response };
  });
};

export default chatRoutes;

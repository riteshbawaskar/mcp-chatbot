import { FastifyPluginAsync } from 'fastify';
import { getProjectStats, listProjects } from '../services/gitlab.js';

const projectRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async () => listProjects());

  fastify.get('/:id/stats', async (request, reply) => {
    const { id } = request.params as { id: string };
    return getProjectStats(id);
  });
};

export default projectRoutes;

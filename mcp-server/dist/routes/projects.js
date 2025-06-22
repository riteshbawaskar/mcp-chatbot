import { getProjectStats, listProjects } from '../services/gitlab.js';
const projectRoutes = async (fastify) => {
    fastify.get('/', async () => listProjects());
    fastify.get('/:id/stats', async (request, reply) => {
        const { id } = request.params;
        return getProjectStats(id);
    });
};
export default projectRoutes;

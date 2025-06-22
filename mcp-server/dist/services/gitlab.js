export async function listProjects() {
    return [{ id: 1, name: 'Project A' }, { id: 2, name: 'Project B' }];
}
export async function getProjectStats(projectId) {
    return {
        projectId,
        sprintProgress: '75%',
        totalDefects: 10,
        openDefects: 3,
        closedDefects: 7,
    };
}

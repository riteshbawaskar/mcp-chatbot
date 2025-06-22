export async function listProjects() {
  return [{ id: 1, name: 'Project A' }, { id: 2, name: 'Project B' }];
}

export async function getProjectStats(projectId: string) {
  return {
    projectId,
    sprintProgress: '75%',
    totalDefects: 10,
    openDefects: 3,
    closedDefects: 7,
  };
}

export async function resolveProjectId(projectName: string): Promise<number | null> {
  const slug = encodeURIComponent(projectName);
  const res = await fetch(`https://gitlab.com/api/v4/projects/${slug}`, {
    headers: { 'PRIVATE-TOKEN': process.env.GITLAB_TOKEN! }
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.id;
}

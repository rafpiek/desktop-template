import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useProjects } from '@/hooks/use-projects';
import { useLastAccessed } from '@/contexts/last-accessed-context';
import { ProjectOverview } from './project-overview';

export function ProjectOverviewWrapper() {
  const { id } = useParams<{ id: string }>();
  const { projects } = useProjects();
  const { setLastProject } = useLastAccessed();
  
  const project = projects.find(p => p.id === id);
  
  useEffect(() => {
    if (project && id) {
      setLastProject(id, project.title);
    }
    // Only run once when component mounts with a valid project
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  
  if (!project) {
    return <div>Project not found</div>;
  }

  return <ProjectOverview project={project} />;
}
import { useParams } from 'react-router-dom';
import { useProjects } from '@/hooks/use-projects';
import { ProjectOverview } from './project-overview';

export function ProjectOverviewWrapper() {
  const { id } = useParams<{ id: string }>();
  const { projects } = useProjects();
  
  const project = projects.find(p => p.id === id);
  
  if (!project) {
    return <div>Project not found</div>;
  }

  return <ProjectOverview project={project} />;
}
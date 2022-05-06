import * as React from "react";
import { ProjectsContextType } from "../@types/projectscontext";
import { VisibleDocument } from "../@types/dcwebviewer";
// @ts-ignore

export const ProjectsContext = React.createContext<ProjectsContextType | null>(
  null
);

const ProjectsProvider: React.FC<React.ReactNode> = ({ children }) => {
  const [selectedProject, setSelectedProject] = React.useState<string>("");

  return (
    <ProjectsContext.Provider value={{ selectedProject, setSelectedProject }}>
      {children}
    </ProjectsContext.Provider>
  );
};

export default ProjectsProvider;

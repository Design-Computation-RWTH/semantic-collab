// @types.dcwebviewer.ts

export type ProjectsContextType = {
  selectedProject: string;
  setSelectedProject: Dispatch<SetStateAction<string>>;
};

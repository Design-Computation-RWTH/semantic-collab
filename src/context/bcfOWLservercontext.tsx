import * as React from "react";
import { ProjectsContextType } from "../@types/projectscontext";
import { BcfOWLServerContextType } from "../@types/bcfowlcontext";
import { VisibleDocument } from "../@types/dcwebviewer";
// @ts-ignore

export const BcfOWLContext =
  React.createContext<BcfOWLServerContextType | null>(null);

const BcfOWLProvider: React.FC<React.ReactNode> = ({ children }) => {
  const [userID, setUserID] = React.useState<string>("");

  return (
    <BcfOWLContext.Provider value={{ userID, setUserID }}>
      {children}
    </BcfOWLContext.Provider>
  );
};

export default BcfOWLProvider;

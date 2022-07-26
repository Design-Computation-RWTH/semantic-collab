import * as React from "react";
import {
  TaskTypes,
} from "../@types/taskTypes";
// @ts-ignore
import { Viewer } from "@xeokit/xeokit-sdk";
import { useState } from "react";

export const TaskContext = React.createContext<TaskTypes | null>(
  null
);

const TaskProvider: React.FC<React.ReactNode> = ({ children }) => {

  const [taskFile, setTaskFile] = React.useState<File | undefined>(undefined);


  return (
    <TaskContext.Provider
      value={{
        taskFile, setTaskFile
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export default TaskProvider;

import * as React from "react";
import {
  TaskTypes,
} from "../@types/taskTypes";
// @ts-ignore

export const TaskContext = React.createContext<TaskTypes | null>(
  null
);

const TaskProvider: React.FC<React.ReactNode> = ({ children }) => {

  const [taskFile, setTaskFile] = React.useState<File | undefined>(undefined);
  const [taskViewState, setTaskViewState] = React.useState<"Preview" | "Creation">("Preview");


  return (
    <TaskContext.Provider
      value={{
        taskFile, setTaskFile, taskViewState, setTaskViewState,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export default TaskProvider;

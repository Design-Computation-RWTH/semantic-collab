import { SetStateAction } from "react";

// @types.taskTypes.ts

export type TaskTypes = {
  taskFile: File | undefined;
  setTaskFile: Dispatch<SetStateAction<File | undefined>>;
};

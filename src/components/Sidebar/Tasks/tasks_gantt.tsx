import { Task } from "gantt-task-react";
import "gantt-task-react/dist/index.css";

export const handleDblClick = (task: Task) => {
  alert("On Double Click event Id:" + task.id);
};

const currentDate = new Date();
export const testtasks: Task[] = [
  {
    start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
    end: new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 15),
    name: "Replace Windows",
    id: "my_replace_window_task",
    progress: 0,
    type: "task",
  },
  {
    start: new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 2),
    end: new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 4,
      4,
      0,
      0
    ),
    name: "Paint Walls",
    id: "my_paint_walls_task",
    progress: 0,
    dependencies: ["my_replace_window_task"],
    type: "task",
  },
];

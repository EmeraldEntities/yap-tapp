import React, { useState, useEffect } from 'react';

import { TaskItem } from '../pages/dashboard';

import {
  RiCheckboxFill,
  RiCheckboxBlankLine,
  RiCheckboxIndeterminateLine,
} from 'react-icons/ri';

export interface TaskProps {
  startedTimer: boolean;
  task: TaskItem;
  deleteHandler: () => void;
  completeHandler: () => void;
}

const Task: React.FC<TaskProps> = ({ startedTimer, task, deleteHandler, completeHandler}) => {
  const [completedTask, setCompletedTask] = useState<boolean>(task.completed);

  const handleClick = (e: React.MouseEvent) => {
    if (startedTimer) {
      setCompletedTask(!completedTask);
      completeHandler();
    } else {
      deleteHandler();
    }
  };

  return (
    <div className="task" onClick={handleClick}>
      {!startedTimer ? (
        <RiCheckboxIndeterminateLine />
      ) : completedTask ? (
        <RiCheckboxFill />
      ) : (
        <RiCheckboxBlankLine />
      )}
      <p className="task-text">{task.description}</p>
    </div>
  );
};

export default Task;

import React, { useState, useEffect } from 'react';
import Task from '../components/Task';

import './dashboard.css';

export interface TaskItem {
  description: string;
  completed: boolean;
}

interface FormattedTime {
  hours: number;
  minutes: number;
  seconds: number;
}

interface TimeSegmentProps {
  timeValue: number;
}

// i would liek to formally apologize for the following warcrimes of code
const Dashboard: React.FC = () => {
  const [newTask, setNewTask] = useState<string>('');
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [timerLength, setTimerLength] = useState<number>();
  const [formattedTime, setFormattedTime] = useState<FormattedTime>();

  const [hourInput, setHourInput] = useState<number>();
  const [minuteInput, setMinuteInput] = useState<number>();
  const [secondInput, setSecondInput] = useState<number>();

  useEffect(() => {
    if (timerLength == undefined) {
      return;
    }

    if (reckoningIsHere()) {
      alert('your time is over');
      setTimerLength(undefined);
      setFormattedTime(undefined);
    } else {
      console.log(timerLength);
      setFormattedTime(getFormattedTime(timerLength));

      const id = window.setTimeout(() => {
        setTimerLength(timerLength - 1);
      }, 1000);
      return () => window.clearTimeout(id);
    }
  }, [timerLength]);

  const getFormattedTime = (timeInSeconds: number): FormattedTime => {
    const hours = Math.floor(timeInSeconds / (60 * 60));
    timeInSeconds = timeInSeconds % (60 * 60);
    const minutes = Math.floor(timeInSeconds / 60);
    timeInSeconds = timeInSeconds % 60;
    const seconds = timeInSeconds;

    const formattedTime = {
      hours: Math.max(0, hours),
      minutes: Math.max(0, minutes),
      seconds: Math.max(0, seconds),
    };

    return formattedTime;
  };

  const TimeSegment: React.FC<TimeSegmentProps> = ({ timeValue }) => {
    return (
      <span className="mx-s">
        <span className="time-segment">
          {String(timeValue).padStart(2, '0')}
        </span>
      </span>
    );
  };

  const Timer: React.FC = () => {
    return (
      <div className="timer">
        <TimeSegment
          timeValue={formattedTime === undefined ? 0 : formattedTime.hours}
        />
        <span className="time-segment">:</span>
        <TimeSegment
          timeValue={formattedTime === undefined ? 0 : formattedTime.minutes}
        />
        <span className="time-segment">:</span>
        <TimeSegment
          timeValue={formattedTime === undefined ? 0 : formattedTime.seconds}
        />
      </div>
    );
  };

  const reckoningIsHere = (): boolean => {
    return (
      formattedTime != undefined &&
      formattedTime.hours == 0 &&
      formattedTime.minutes == 0 &&
      formattedTime.seconds == 0
    );
  };

  const TaskList: React.FC = () => {
    tasks.forEach((task) => {
      console.log(task.completed);
    });

    const listResults = tasks.map((task) => {
      const removeHandler = () => {
        setTasks(
          tasks.filter(function (check) {
            return check !== task;
          })
        );
      };

      const completeHandler = () => {
        task.completed = true;
      };

      return timerLength !== undefined ? (
        <Task
          key={task.description}
          task={task}
          startedTimer
          deleteHandler={removeHandler}
          completeHandler={completeHandler}
        />
      ) : (
        <Task
          key={task.description}
          task={task}
          startedTimer={false}
          deleteHandler={removeHandler}
          completeHandler={completeHandler}
        />
      );
    });

    return <div className="tasklist">{listResults}</div>;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (newTask !== undefined && newTask != '') {
        const newList = tasks.concat({
          description: newTask,
          completed: false,
        });
        setTasks(newList);
        setNewTask('');
      }
    }
  };

  const startTimer = () => {
    console.log('starting timer');
    setTimerLength(3);
  };

  const button = (
    <div className="main-button timer-button-size">
      <p className="button-text timer-button-text-size" onClick={startTimer}>
        Start
      </p>
    </div>
  );

  const taskInput = (
    <div className="new-task-input-div">
      <input
        className="new-task-input"
        onChange={(e) => setNewTask(e.target.value)}
        placeholder="add a new item..."
        onKeyDown={(e) => handleKeyDown(e)}
        value={newTask}
        id="bad-bad-input"
      />
    </div>
  );

  return (
    <div className="main-dashboard-container">
      <div className="usable-space">
        <Timer />
        <TaskList />

        <div className="buttons">
          {timerLength === undefined ? taskInput : undefined}
          {timerLength === undefined ? button : undefined}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

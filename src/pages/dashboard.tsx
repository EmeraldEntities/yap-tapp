import React, { useState, useEffect } from 'react';
import Task from '../components/Task';

import { useScript } from "../utils/functions";

import './dashboard.css';
import axios from 'axios';
import FacebookLoginButton from '../utils/facebookLoginButton';

declare global {
  interface Window {
    fbAsyncInit: () => void;
  }
}

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

let userId = '';
let pageAccessToken = '';
let shortLivedUserToken: string = '';
const setShortLivedUserToken = (token: string, expiresIn: number) => { //milliseconds
  shortLivedUserToken = token;
  setTimeout(clearShortLivedUserToken, expiresIn);
}
const clearShortLivedUserToken = () => {
  shortLivedUserToken = ''
}

let longLivedUserToken: string = '';
const setLongLivedUserToken = (token: string, expiresIn: number) => { //milliseconds
  longLivedUserToken = token;
  setTimeout(clearLongLivedUserToken, expiresIn);
}
const clearLongLivedUserToken = () => {
  longLivedUserToken = ''
}

let pageTokens: string[] = [];
const clearPageTokens = () => {
  pageTokens = [];
}

const updateShortLivedUserToken = () => {
  FB.getLoginStatus(function(response: any) {
    if (response.status === 'connected') {
      setShortLivedUserToken(response.authResponse['accessToken'], response.authResponse['reauthorize_required_in']!*1000);
      userId = response.authResponse['userID'];
    } else {
      if (facebookLogin()) {
        updateShortLivedUserToken();
      } else {
        // display something?
        // return to home
        console.log("return to home");
      }
    }
  });
}

const updateLongLivedUserToken = () => {
  updateShortLivedUserToken();
  axios.get('https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&'
          +`client_id=${process.env.REACT_APP_FACEBOOK_APP_ID}&`
          +`client_secret=${process.env.REACT_APP_FACEBOOK_APP_SECRET}&`
          +`fb_exchange_token=${shortLivedUserToken}`)
  .then(response => {
    setLongLivedUserToken(response.data['access_token'], response.data['expires_in']*1000);
  });
}

const updatePageAccessToken = () => {
  axios.get(`https://graph.facebook.com/${process.env.REACT_APP_FACEBOOK_PAGE_ID}?`  //TODO: figure out how to get the page id the user chose in login
            + 'fields=access_token&'
            + `access_token=${shortLivedUserToken}`)
  .then(response => {
  pageAccessToken = response.data['access_token'];
  });
  
}
const facebookLogin = (): boolean => {
  FB.login(function(response: any){
    if (response.status === 'connected') {
      return true;
    } else {
      return false;
    }
  }, {scope: 'pages_manage_posts, pages_read_engagement'});
  return false;
}

const publishPostToPage = (message: string) => {
  axios.post(`https://graph.facebook.com/${process.env.REACT_APP_FACEBOOK_PAGE_ID}/feed`
  +`?message=${message}`
  +`&access_token=${pageAccessToken}`);
}

const facebookLogout = () => {
  FB.logout(function(response: any) {
    // Person is now logged out
  });
}

// i would like to formally apologize for the following war crimes of code
const Dashboard: React.FC = () => {
  useScript('../utils/initFacebook.js');
  const [newTask, setNewTask] = useState<string>('');
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [timerLength, setTimerLength] = useState<number>();
  const [formattedTime, setFormattedTime] = useState<FormattedTime>();

  const [hourInput, setHourInput] = useState<number>(0);
  const [minuteInput, setMinuteInput] = useState<number>(0);
  const [secondInput, setSecondInput] = useState<number>(0);


  const runResults = () => {
    setTimerLength(undefined);
    setFormattedTime(undefined);

    const failedTasks = tasks.filter((task) => task.completed != true);
    if (failedTasks.length != 0) {
      publishPostToPage("Wow I just failed my tasks");
      alert("You failed...");
    } else {
      alert("Epic! You finished all the tasks.");
    }

    // purge tasks
    setTasks([]);
  }
  
  useEffect(() => {
    if (timerLength == undefined) {
      return;
    }

    if (reckoningIsHere()) {
      runResults();    
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
    if (timerLength === undefined) {
      return (
        <div className="timer">
          {/* this produces scuffed input but idk how to fix it */}
          <input
            className="timer-input"
            placeholder="00"
            id="hour"
            type="number"
            onChange={(e) => setHourInput(parseInt(e.target.value))}
            value={hourInput == 0 ? "00" : hourInput}
            max={99}
            min={0}
          />
          <span className="time-segment">:</span>
          <input
            className="timer-input"
            placeholder="00"
            id="minute"
            type="number"
            onChange={(e) => setMinuteInput(parseInt(e.target.value))}
            value={minuteInput == 0 ? "00" : minuteInput}
            max={59}
            min={0}
          />
          <span className="time-segment">:</span>
          <input
            className="timer-input"
            placeholder="00"
            id="second"
            type="number"
            onChange={(e) => setSecondInput(parseInt(e.target.value))}
            value={secondInput == 0 ? "00" : secondInput}
            max={59}
            min={0}
          />
        </div>
      );
    }

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
    setTimerLength(hourInput * (60*60) + minuteInput * 60 + secondInput);
  };

  const buttonOnClick = () => {
    if (tasks.length == 0) {
      alert("Please enter at least 1 task.")
    } else if (hourInput+ minuteInput + secondInput == 0) {
      alert("Invalid timer input.")
    } else {
      updateLongLivedUserToken();
      updatePageAccessToken();
      startTimer();
    }
  }

  const button = (
    <div className="main-button timer-button-size">
      <p className="button-text timer-button-text-size" onClick={buttonOnClick}>
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
        maxLength={70}
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
          <FacebookLoginButton />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

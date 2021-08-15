import React, { useState, useEffect } from 'react';
import { useScript } from "../utils/functions";
import './dashboard.css';
import axios from 'axios';

declare global {
  interface Window {
    fbAsyncInit: () => void;
  }
}

interface Task {
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
      console.log(response.authResponse['accessToken']);
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
  .then((response: any) => {
    setLongLivedUserToken(response['access_token'], response['expires_in']*1000);
  });
}

const updatePageAccessToken = () => {
  axios.get('https://graph.facebook.com/PAGE-ID?'  //TODO: figure out how to get the page id the user chose in login
    + 'fields=access_token&'
    + `access_token=${longLivedUserToken}`
  );
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

const publicPostToPage = (message: string) => {
  axios.post('https://graph.facebook.com/{page-id}/feed'
  +`?message=${message}`
  +'&access_token={page-access-token}');
}
const facebookLogout = () => {
  FB.logout(function(response: any) {
    // Person is now logged out
  });
}

// i would like to formally apologize for the following war crimes of code
const Dashboard: React.FC = () => {
  

  const [newTask, setNewTask] = useState<string>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timerLength, setTimerLength] = useState<number>();
  const [formattedTime, setFormattedTime] = useState<FormattedTime>();

  const [hourInput, setHourInput] = useState<number>();
  const [minuteInput, setMinuteInput] = useState<number>();
  const [secondInput, setSecondInput] = useState<number>();

  window.fbAsyncInit = () => {
    FB.init({
      appId            : process.env.REACT_APP_FACEBOOK_APP_ID,
      autoLogAppEvents : true,
      xfbml            : true,
      version          : 'v11.0'
    });
    (function (d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) { return; }
        js = d.createElement(s);
        js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js"; // how do i fix this
        fjs.parentNode?.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
    console.log('hi------------------------------------------------------');
    updateLongLivedUserToken();
    updatePageAccessToken();
  };
  
  useEffect(() => {
    if (timerLength == undefined) {
      return;
    }
    
    if (reckoningIsHere()) {
      alert('your time is over');
      setTimerLength(undefined);
      setFormattedTime(undefined);
    } else {
      console.log(timerLength)
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
    return <div className="tasklist"></div>;
  };

  const handleKeyDown = (e:React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (newTask !== undefined && newTask != "") {
        const newList = tasks.concat({description: newTask, completed: false});
        setTasks(newList);
        setNewTask("");
      }
    }
  };

  const startTimer = () => {
    console.log("starting timer")
    setTimerLength(3);
  }
  
  return (
    <div className="main-dashboard-container">
      <div className="usable-space">
        <Timer />
        <TaskList />

        <div className="buttons">
          <div className="new-task-input-div">
            <input
              className="new-task-input"
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="add a new item..."
              onKeyDown={(e) => handleKeyDown(e)}
            />
          </div>

          <div className="main-button timer-button-size">
            <p className="button-text timer-button-text-size" onClick={startTimer}>Start</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

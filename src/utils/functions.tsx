import React from "react";
import { useEffect } from 'react';

export const useScript = (scriptUrl: string) => {
  useEffect(() => {
    const script = document.createElement('script');

    script.src = scriptUrl;
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    }
  }, [scriptUrl]);
};

const facebookLogin: React.FC = () => {
  return (
    <div>
      <p>This is the about us page</p>
    </div>
  );
};

const sendFacebookPost: React.FC = () => {
  return (
    <div>
      <p>This is the about us page</p>
    </div>
  );
};

const functions = {useScript, facebookLogin, sendFacebookPost};

export default functions;
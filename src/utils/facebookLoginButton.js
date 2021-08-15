import React from 'react';
import FacebookLogin from 'react-facebook-login';

class FacebookLoginButton extends React.Component {
  responseFacebook(response) {
    console.log(response);
  }

  render() {
    return (
      <FacebookLogin
        appId={process.env.REACT_APP_FACEBOOK_APP_ID}
        autoLoad={true}
        fields="name,email,picture"
        scope="public_profile,pages_manage_posts,pages_read_engagement"
        callback={this.responseFacebook}
      />
    )
  }
}

export default FacebookLoginButton;
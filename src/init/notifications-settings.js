import React from 'react'
import ReactDOM from 'react-dom'
import NotificationSettings, {RequestNotificationSettings}  from '@aktionariat/notification-settings/dist/NotificationSettings.bundle.es.js'
import defaultProps from '@aktionariat/notification-settings/component/defaultProps.json'
import ReadUrlVars from '@aktionariat/read-url-vars/dist/ReadUrlVars.bundle.es.js'

const props = {...defaultProps, ...{
  debug: false,
  getUrl: `https://aktionariat.com/notificationsettings`,
  postUrl: `https://aktionariat.com/updatenotificationsettings`
}}

const Output = () => (
  <ReadUrlVars>
    <RequestNotificationSettings {...props}>
      <NotificationSettings  />
    </RequestNotificationSettings>
  </ReadUrlVars>
)

ReactDOM.render(<Output />, document.getElementById('notification-settings'));

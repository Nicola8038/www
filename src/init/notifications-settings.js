import React from 'react'
import ReactDOM from 'react-dom'
import EmailSubscription from '@aktionariat/email-subscription/dist/EmailSubscription.bundle.es.min.js'
import TokenLevelSubscription, {TokenActivitySubscription} from '@aktionariat/token-activity-subscription/dist/TokenActivitySubscription.bundle.es.min.js'
import NotificationSettings, {RequestNotificationSettings} from '@aktionariat/notification-settings/dist/NotificationSettings.bundle.es.min.js'
import defaultProps from '@aktionariat/notification-settings/component/defaultProps.json'
import {parseUrlQueryToObject} from '@aktionariat/utility-js'

const urlVars = parseUrlQueryToObject(window.location)

const props = {...defaultProps, ...{
  debug: false,
  getUrl: `https://aktionariat.com/notificationsettings`,
  postUrl: `https://aktionariat.com/updatenotificationsettings`,
  email: urlVars.email,
  code: urlVars.code
}}

const notificationEmail = document.querySelector('.notification__email')
if(notificationEmail) notificationEmail.innerText = urlVars.email


ReactDOM.render(
  <RequestNotificationSettings {...props}>
    <NotificationSettings>
      <EmailSubscription subscriptionToggleLabel="Aktionariat Newsletter" />
    </NotificationSettings>
  </RequestNotificationSettings>
  ,  document.getElementById('notification-settings__email-subscription'));

ReactDOM.render(
  <RequestNotificationSettings {...props}>
    <NotificationSettings>
      <TokenLevelSubscription />
    </NotificationSettings>
  </RequestNotificationSettings>
  , document.getElementById('notification-settings__token-level-subscription'));

ReactDOM.render(
  <RequestNotificationSettings {...props}>
    <NotificationSettings>
      <TokenActivitySubscription />
    </NotificationSettings>
  </RequestNotificationSettings>
  ,  document.getElementById('notification-settings__token-activity-subscription'));

import React from 'react'
import ReactDOM from 'react-dom'
import EmailSubscription from '@aktionariat/email-subscription/dist/EmailSubscription.bundle.es.js'
import TokenActivitySubscription, {TokenLevelSubscription, TokenTickerList} from '@aktionariat/token-activity-subscription/dist/TokenActivitySubscription.bundle.es.js'
import NotificationSettings from '@aktionariat/notification-settings/dist/NotificationSettings.bundle.es.js'
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

const notificationEmail = document.getElementById('notification__email')
if(notificationEmail) notificationEmail.innerText = urlVars.email

console.log(props)

ReactDOM.render(
  <NotificationSettings {...props}>
    <EmailSubscription subscriptionToggleLabel="Aktionariat Newsletter" />
  </NotificationSettings>
  ,  document.getElementById('notification-settings__email-subscription'));

ReactDOM.render(
  <NotificationSettings {...props}>
    <TokenLevelSubscription />
  </NotificationSettings>
  , document.getElementById('notification-settings__token-level-subscription'));

ReactDOM.render(
  <NotificationSettings {...props}>
    <TokenTickerList />
  </NotificationSettings>
  , document.getElementById('notification-settings__token-ticker-list'));

ReactDOM.render(
  <NotificationSettings {...props}>
    <TokenActivitySubscription />
  </NotificationSettings>
  ,  document.getElementById('notification-settings__token-activity-subscription'));

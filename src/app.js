import { ajax } from 'rxjs/ajax';
import { interval, map, tap } from 'rxjs';

const messagesId = [];
const container = document.querySelector('.message-container');
let time;

function cuteSubject(text) {
  if (text.length <= 15) {
    return text;
  }

  return `${text.slice(0, 16)}...`;
}

function parseDate(datetime) {
  const date = new Date(datetime);
  const day = String(date.getDate()).length === 2 ? `${date.getDate()}` : `0${date.getDate()}`;
  const month = String(date.getMonth()).length === 2 ? `${date.getMonth()}` : `0${date.getMonth()}`;
  const hour = String(date.getHours()).length === 2 ? `${date.getHours()}` : `0${date.getHours()}`;
  const minutes = String(date.getMinutes()).length === 2 ? `${date.getMinutes()}` : `0${date.getMinutes()}`;

  return `${day}.${month}.${date.getFullYear()} ${hour}:${minutes}`;
}

function setTime(t) {
  time = parseDate(t);
}

function drawMessage(message) {
  const element = `<div class="message">
    <div class="message-from">${message.from}</div>
    <div class="message-subject">${cuteSubject(message.subject)}</div>
    <div class="message-time">${time}</div>
  </div>`;

  container.insertAdjacentHTML('afterbegin', element);
}

function updateMessages(serverMessages) {
  for (let i = 0; i < serverMessages.length; i += 1) {
    messagesId.push(serverMessages[i].id);
    drawMessage(serverMessages[i]);
  }
}

function request() {
  const response$ = ajax({
    url: 'http://localhost:8080/messages/unread',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin, Content-Type',
    },
  }).pipe(
    tap((x) => setTime(x.response.timestamp)),
    map((message) => message.response.messages),
  );

  response$.subscribe({
    next: (value) => {
      const messages = value.filter((message) => !messagesId.includes(message.id));
      updateMessages(messages);
    },
    error: (err) => console.log(err),
  });
}

const update = interval(5000);

update.subscribe(() => {
  request();
});

const http = require('http');
const WebSocket = require('ws');
const server = http.createServer();
const wss = new WebSocket.Server({ server });

let sessions = new Map();

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    try {
      const parsedMessage = JSON.parse(message);
      if (parsedMessage.type === 'startTimer') {
        console.log("Timer started");
        let sessionId = Math.random().toString(36).substring(2, 9);
        ws.sessionId = sessionId;
        sessions.set(sessionId, { timeLeft: 900, intervalId: null });

        const intervalId = setInterval(() => {
          const state = sessions.get(sessionId);
          if (state) {
            state.timeLeft -= 1;
            ws.send(JSON.stringify({ type: 'timerUpdate', timeLeft: state.timeLeft }));
            if (state.timeLeft <= 0) {
              clearInterval(intervalId);
              state.intervalId = null;
            } else {
              sessions.set(sessionId, state);
            }
          }
        }, 1000);

        sessions.get(sessionId).intervalId = intervalId;
      } else if (parsedMessage.type === 'triggerRedLight') {
        const state = sessions.get(ws.sessionId);
        if (state && state.intervalId) {
          clearInterval(state.intervalId);
          state.redLightTriggered = true;
          state.intervalId = null;
          ws.send(JSON.stringify({ type: 'redLightTriggered' }));
        }
      }
    } catch (e) {
      console.error("Error parsing message:", e);
    }
  });
});

server.listen(8080, () => {
  console.log('Server running at http://localhost:8080/');
});
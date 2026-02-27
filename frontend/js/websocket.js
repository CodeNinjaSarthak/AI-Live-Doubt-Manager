/**
 * WebSocket client with exponential backoff reconnection.
 */

class DashboardWebSocket {
  constructor() {
    this.ws = null;
    this.handlers = {};
    this.retryCount = 0;
    this.maxRetries = 10;
    this._sessionId = null;
  }

  connect(sessionId) {
    this._sessionId = sessionId;
    const token = localStorage.getItem('token');
    const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
    const tokenParam = token ? `&token=${encodeURIComponent(token)}` : '';
    const url = `${protocol}://${location.host}/ws/${sessionId}?connection_id=${Date.now()}${tokenParam}`;

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.retryCount = 0;
      this._emit('connected', {});
    };

    this.ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        this._emit(msg.type, msg.data || msg);
      } catch (err) {
        console.error('WS parse error', err);
      }
    };

    this.ws.onclose = (e) => {
      // Auth/forbidden errors — do not retry
      if (e.code === 4001 || e.code === 4003) {
        this._emit('error', { msg: 'WebSocket auth error' });
        return;
      }
      if (this.retryCount >= this.maxRetries) {
        this._emit('error', { msg: 'Connection lost after maximum retries' });
        return;
      }
      const delay = Math.min(1000 * Math.pow(2, this.retryCount), 30000);
      this.retryCount++;
      setTimeout(() => {
        if (this._sessionId) this.connect(this._sessionId);
      }, delay);
    };

    this.ws.onerror = () => {
      this._emit('error', { msg: 'WebSocket error' });
    };
  }

  on(type, cb) {
    this.handlers[type] = cb;
  }

  _emit(type, data) {
    if (this.handlers[type]) this.handlers[type](data);
  }

  send(obj) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(obj));
    }
  }

  disconnect() {
    this._sessionId = null;
    if (this.ws) {
      this.ws.onclose = null; // prevent reconnect
      this.ws.close();
      this.ws = null;
    }
  }
}

window.dashboardWS = new DashboardWebSocket();

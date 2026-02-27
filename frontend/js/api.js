/**
 * API client for AI Live Doubt Manager.
 * Handles all fetch calls with auth, error handling, and 401 auto-logout.
 */

class API {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  async request(method, path, body = null) {
    const opts = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {}),
      },
      ...(body !== null ? { body: JSON.stringify(body) } : {}),
    };

    const resp = await fetch(path, opts);

    if (resp.status === 401) {
      this.token = null;
      localStorage.removeItem('token');
      // Emit custom event so app can react without causing reload loops
      window.dispatchEvent(new CustomEvent('auth:expired'));
      throw new Error('Unauthorized');
    }

    if (resp.status === 429) {
      throw new Error('rate_limit');
    }

    if (!resp.ok) {
      let message = `HTTP ${resp.status}`;
      try {
        const errBody = await resp.json();
        message = errBody.detail || errBody.message || message;
      } catch {
        // ignore parse error
      }
      throw new Error(message);
    }

    if (resp.status === 204) return null;
    return resp.json();
  }

  // ----------------------------------------------------------------
  // Auth
  // ----------------------------------------------------------------

  async login(email, password) {
    const form = new FormData();
    form.append('username', email);
    form.append('password', password);

    const resp = await fetch('/api/v1/auth/login', { method: 'POST', body: form });
    if (!resp.ok) {
      let msg = 'Login failed';
      try { const e = await resp.json(); msg = e.detail || msg; } catch {}
      throw new Error(msg);
    }
    const data = await resp.json();
    this.token = data.access_token;
    localStorage.setItem('token', this.token);
    return data;
  }

  async register(email, password, name) {
    const data = await this.request('POST', '/api/v1/auth/register', {
      email, password, name,
    });
    return data;
  }

  async logout() {
    try { await this.request('POST', '/api/v1/auth/logout'); } catch {}
    this.token = null;
    localStorage.removeItem('token');
    window.location.reload();
  }

  async getMe() {
    return this.request('GET', '/api/v1/auth/me');
  }

  // ----------------------------------------------------------------
  // Sessions
  // ----------------------------------------------------------------

  async getSessions() {
    return this.request('GET', '/api/v1/sessions/');
  }

  async createSession(data) {
    return this.request('POST', '/api/v1/sessions/', data);
  }

  async endSession(id) {
    return this.request('POST', `/api/v1/sessions/${id}/end`);
  }

  async getSessionComments(id, limit = 100, offset = 0) {
    return this.request('GET', `/api/v1/sessions/${id}/comments?limit=${limit}&offset=${offset}`);
  }

  async getSessionClusters(id) {
    return this.request('GET', `/api/v1/sessions/${id}/clusters`);
  }

  async getSessionStats(id) {
    return this.request('GET', `/api/v1/dashboard/sessions/${id}/stats`);
  }

  // ----------------------------------------------------------------
  // YouTube
  // ----------------------------------------------------------------

  async getYouTubeAuthURL(returnUrl = '/app') {
    return this.request('GET', `/api/v1/youtube/auth/url?return_url=${encodeURIComponent(returnUrl)}`);
  }

  async getYouTubeStatus() {
    return this.request('GET', '/api/v1/youtube/auth/status');
  }

  async disconnectYouTube() {
    return this.request('DELETE', '/api/v1/youtube/auth/disconnect');
  }

  async validateVideo(videoId) {
    return this.request('GET', `/api/v1/youtube/videos/${videoId}/validate`);
  }

  // ----------------------------------------------------------------
  // Dashboard
  // ----------------------------------------------------------------

  async submitManualQuestion(sessionId, text) {
    return this.request('POST', `/api/v1/dashboard/sessions/${sessionId}/manual-question`, { text });
  }

  async approveAnswer(answerId) {
    return this.request('POST', `/api/v1/dashboard/answers/${answerId}/approve`);
  }

  async editAnswer(answerId, text) {
    return this.request('POST', `/api/v1/dashboard/answers/${answerId}/edit`, { text });
  }

  // ----------------------------------------------------------------
  // Metrics
  // ----------------------------------------------------------------

  async getMetrics() {
    return this.request('GET', '/api/v1/metrics');
  }
}

window.api = new API();

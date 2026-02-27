/**
 * Main application logic for AI Live Doubt Manager dashboard.
 */

const app = (() => {
  // ----------------------------------------------------------------
  // State
  // ----------------------------------------------------------------
  let currentUser = null;
  let activeSession = null;
  let feedCount = 0;
  let statsRefreshTimer = null;

  // ----------------------------------------------------------------
  // Toast Notifications
  // ----------------------------------------------------------------
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  // ----------------------------------------------------------------
  // Loading state helpers
  // ----------------------------------------------------------------
  function setLoading(btn, loading, loadingText = 'Loading...') {
    if (!btn) return;
    if (loading) {
      btn._originalText = btn.textContent;
      btn.textContent = loadingText;
      btn.classList.add('btn-loading');
      btn.disabled = true;
    } else {
      btn.textContent = btn._originalText || btn.textContent;
      btn.classList.remove('btn-loading');
      btn.disabled = false;
    }
  }

  // ----------------------------------------------------------------
  // View switching
  // ----------------------------------------------------------------
  function showDashboard() {
    document.getElementById('auth-view').hidden = true;
    document.getElementById('dashboard-view').hidden = false;
  }

  function showAuth() {
    document.getElementById('auth-view').hidden = false;
    document.getElementById('dashboard-view').hidden = true;
  }

  function showLogin() {
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('login-error').classList.add('hidden');
  }

  function showRegister() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
    document.getElementById('register-error').classList.add('hidden');
  }

  // ----------------------------------------------------------------
  // Auth Handlers
  // ----------------------------------------------------------------
  async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('login-btn');
    const errEl = document.getElementById('login-error');

    errEl.classList.add('hidden');
    setLoading(btn, true, 'Signing in...');
    try {
      await api.login(email, password);
      await initDashboard();
    } catch (e) {
      errEl.textContent = e.message || 'Login failed';
      errEl.classList.remove('hidden');
    } finally {
      setLoading(btn, false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const btn = document.getElementById('register-btn');
    const errEl = document.getElementById('register-error');

    errEl.classList.add('hidden');
    setLoading(btn, true, 'Creating account...');
    try {
      await api.register(email, password, name);
      // Auto-login after registration
      await api.login(email, password);
      await initDashboard();
    } catch (e) {
      errEl.textContent = e.message || 'Registration failed';
      errEl.classList.remove('hidden');
    } finally {
      setLoading(btn, false);
    }
  }

  async function logout() {
    await api.logout();
  }

  // ----------------------------------------------------------------
  // Dashboard Initialization
  // ----------------------------------------------------------------
  async function initDashboard() {
    try {
      currentUser = await api.getMe();
    } catch (e) {
      showAuth();
      return;
    }

    document.getElementById('user-name').textContent =
      currentUser.name || currentUser.email || '';

    showDashboard();
    await loadYouTubeStatus();

    // Load most recent active session if any
    try {
      const sessions = await api.getSessions();
      const active = sessions.find(s => s.is_active);
      if (active) {
        setActiveSession(active);
      }
    } catch (e) {
      // ignore
    }
  }

  // ----------------------------------------------------------------
  // Session Management
  // ----------------------------------------------------------------
  async function handleCreateSession(event) {
    event.preventDefault();
    const title = document.getElementById('session-title').value.trim();
    const videoId = document.getElementById('session-video-id').value.trim();
    const btn = document.getElementById('create-session-btn');

    setLoading(btn, true, 'Starting...');
    try {
      const session = await api.createSession({
        title,
        youtube_video_id: videoId || null,
      });
      setActiveSession(session);
      showToast('Session started!', 'success');
    } catch (e) {
      showToast(e.message || 'Failed to create session', 'error');
    } finally {
      setLoading(btn, false);
    }
  }

  function setActiveSession(session) {
    activeSession = session;

    document.getElementById('no-session').hidden = true;
    document.getElementById('active-session').hidden = false;
    document.getElementById('active-session-title').textContent = session.title;

    const videoEl = document.getElementById('active-session-video');
    if (session.youtube_video_id) {
      videoEl.textContent = `YouTube: ${session.youtube_video_id}`;
    } else {
      videoEl.textContent = 'Manual mode (no YouTube video)';
    }

    // Connect WebSocket
    dashboardWS.disconnect();
    registerWebSocketHandlers();
    dashboardWS.connect(session.id);

    // Start stats refresh
    refreshStats();
    if (statsRefreshTimer) clearInterval(statsRefreshTimer);
    statsRefreshTimer = setInterval(refreshStats, 10000);

    // Load existing comments and clusters
    loadComments();
    loadClusters();
  }

  async function endSession() {
    if (!activeSession) return;
    const btn = document.getElementById('end-session-btn');
    setLoading(btn, true, 'Ending...');
    try {
      await api.endSession(activeSession.id);
      activeSession = null;
      dashboardWS.disconnect();
      if (statsRefreshTimer) clearInterval(statsRefreshTimer);

      document.getElementById('no-session').hidden = false;
      document.getElementById('active-session').hidden = true;
      document.getElementById('questions-feed').innerHTML =
        '<p class="empty-msg">Session ended.</p>';
      document.getElementById('clusters-list').innerHTML =
        '<p class="empty-msg">No clusters yet.</p>';
      feedCount = 0;
      document.getElementById('feed-count').textContent = '0';
      showToast('Session ended', 'info');
    } catch (e) {
      showToast(e.message || 'Failed to end session', 'error');
    } finally {
      setLoading(btn, false);
    }
  }

  // ----------------------------------------------------------------
  // YouTube OAuth
  // ----------------------------------------------------------------
  async function connectYouTube() {
    const btn = document.getElementById('yt-connect-btn');
    setLoading(btn, true, 'Connecting...');
    try {
      const data = await api.getYouTubeAuthURL('/app');
      const popup = window.open(
        data.url,
        'youtube_oauth',
        'width=600,height=700,noopener'
      );

      // Listen for postMessage from OAuth result page
      const onMessage = (event) => {
        if (event.origin !== location.origin) return;
        if (event.data && event.data.type === 'youtube_oauth_complete') {
          window.removeEventListener('message', onMessage);
          if (popup && !popup.closed) popup.close();
          loadYouTubeStatus();
          showToast('YouTube connected!', 'success');
        }
      };
      window.addEventListener('message', onMessage);

      // Clean up if popup is closed without completing
      const pollClosed = setInterval(() => {
        if (popup && popup.closed) {
          clearInterval(pollClosed);
          window.removeEventListener('message', onMessage);
          setLoading(btn, false);
          loadYouTubeStatus();
        }
      }, 500);
    } catch (e) {
      showToast(e.message || 'Failed to start YouTube OAuth', 'error');
      setLoading(btn, false);
    }
  }

  async function disconnectYouTube() {
    const btn = document.getElementById('yt-disconnect-btn');
    setLoading(btn, true, 'Disconnecting...');
    try {
      await api.disconnectYouTube();
      await loadYouTubeStatus();
      showToast('YouTube disconnected', 'info');
    } catch (e) {
      showToast(e.message || 'Failed to disconnect', 'error');
    } finally {
      setLoading(btn, false);
    }
  }

  async function loadYouTubeStatus() {
    try {
      const status = await api.getYouTubeStatus();
      const badge = document.getElementById('yt-status-badge');
      const connectRow = document.getElementById('yt-connect-row');
      const connectedRow = document.getElementById('yt-connected-row');
      const expiresEl = document.getElementById('yt-expires-at');

      if (status.connected) {
        badge.textContent = 'Connected';
        badge.className = 'badge badge-connected';
        connectRow.hidden = true;
        connectedRow.hidden = false;
        if (status.expires_at) {
          expiresEl.textContent = `Token expires: ${new Date(status.expires_at).toLocaleString()}`;
        }
      } else {
        badge.textContent = 'Disconnected';
        badge.className = 'badge badge-disconnected';
        connectRow.hidden = false;
        connectedRow.hidden = true;
        // Re-enable connect button in case it was loading
        setLoading(document.getElementById('yt-connect-btn'), false);
      }
    } catch (e) {
      // ignore — not critical
    }
  }

  // ----------------------------------------------------------------
  // Manual Questions
  // ----------------------------------------------------------------
  async function submitManualQuestions() {
    if (!activeSession) {
      showToast('Start a session first', 'warning');
      return;
    }
    const textarea = document.getElementById('manual-textarea');
    const text = textarea.value.trim();
    if (!text) return;

    const btn = document.getElementById('manual-submit-btn');
    setLoading(btn, true, 'Submitting...');
    try {
      const result = await api.submitManualQuestion(activeSession.id, text);
      textarea.value = '';
      showToast(`${result.created} question(s) submitted`, 'success');
    } catch (e) {
      if (e.message === 'rate_limit') {
        showToast('Rate limit hit, try again in 60s', 'warning');
      } else {
        showToast(e.message || 'Failed to submit questions', 'error');
      }
    } finally {
      setLoading(btn, false);
    }
  }

  // ----------------------------------------------------------------
  // Feed (Questions)
  // ----------------------------------------------------------------
  async function loadComments() {
    if (!activeSession) return;
    try {
      const comments = await api.getSessionComments(activeSession.id, 100, 0);
      const feed = document.getElementById('questions-feed');
      feed.innerHTML = '';
      feedCount = 0;
      comments.forEach(c => appendFeedItem(c));
    } catch (e) {
      // ignore
    }
  }

  function appendFeedItem(comment) {
    const feed = document.getElementById('questions-feed');

    // Remove empty message if present
    const empty = feed.querySelector('.empty-msg');
    if (empty) empty.remove();

    const item = document.createElement('div');
    item.className = 'feed-item';
    item.dataset.commentId = comment.id;

    let badgeHtml = '<span class="badge badge-classifying">Classifying...</span>';
    if (comment.is_question === true) {
      badgeHtml = '<span class="badge badge-question">Question</span>';
    } else if (comment.is_question === false) {
      badgeHtml = '<span class="badge badge-not-question">Not a question</span>';
    }

    item.innerHTML = `
      <span class="feed-item-author">${escHtml(comment.author_name || 'Unknown')}</span>
      <span class="feed-item-text">${escHtml(comment.text)}</span>
      <span class="feed-item-badge">${badgeHtml}</span>
    `;

    feed.prepend(item);
    feedCount++;
    document.getElementById('feed-count').textContent = feedCount;
  }

  function updateFeedItemBadge(commentId, isQuestion) {
    const item = document.querySelector(`[data-comment-id="${commentId}"]`);
    if (!item) return;
    const badgeEl = item.querySelector('.feed-item-badge');
    if (!badgeEl) return;
    if (isQuestion) {
      badgeEl.innerHTML = '<span class="badge badge-question">Question</span>';
    } else {
      badgeEl.innerHTML = '<span class="badge badge-not-question">Not a question</span>';
    }
  }

  // ----------------------------------------------------------------
  // Clusters
  // ----------------------------------------------------------------
  async function loadClusters() {
    if (!activeSession) return;
    try {
      const clusters = await api.getSessionClusters(activeSession.id);
      const list = document.getElementById('clusters-list');
      list.innerHTML = '';
      if (!clusters.length) {
        list.innerHTML = '<p class="empty-msg">No clusters yet.</p>';
        return;
      }
      clusters.forEach(cluster => upsertClusterCard(cluster));
    } catch (e) {
      // ignore
    }
  }

  function upsertClusterCard(cluster) {
    const list = document.getElementById('clusters-list');

    // Remove empty message
    const empty = list.querySelector('.empty-msg');
    if (empty) empty.remove();

    let card = document.querySelector(`[data-cluster-id="${cluster.id}"]`);
    if (!card) {
      card = document.createElement('div');
      card.className = 'cluster-card';
      card.dataset.clusterId = cluster.id;
      list.prepend(card);
    }

    const answers = cluster.answers || [];
    const latestAnswer = answers[answers.length - 1];

    let answerHtml = '<p class="hint">Generating answer...</p>';
    let actionsHtml = '';

    if (latestAnswer) {
      const postedBadge = latestAnswer.is_posted
        ? '<span class="badge badge-posted">Posted</span>'
        : '<span class="badge badge-pending">Pending</span>';

      answerHtml = `
        <div class="cluster-answer" id="answer-text-${latestAnswer.id}">${escHtml(latestAnswer.text)}</div>
        <div style="margin-bottom:6px;">${postedBadge}</div>
      `;
      actionsHtml = `
        <button class="btn btn-sm" onclick="app.copyAnswer('${latestAnswer.id}')">Copy</button>
      `;
      if (!latestAnswer.is_posted) {
        actionsHtml += `
          <button class="btn btn-primary btn-sm" id="approve-btn-${latestAnswer.id}"
            onclick="app.approveAnswer('${latestAnswer.id}')">Approve &amp; Post</button>
        `;
      }
    }

    card.innerHTML = `
      <div class="cluster-header">
        <span class="cluster-title">${escHtml(cluster.title || 'Untitled Cluster')}</span>
        <span class="cluster-count">${cluster.comment_count || 0} questions</span>
      </div>
      ${answerHtml}
      <div class="cluster-actions">${actionsHtml}</div>
    `;
  }

  async function approveAnswer(answerId) {
    const btn = document.getElementById(`approve-btn-${answerId}`);
    setLoading(btn, true, 'Posting...');
    try {
      await api.approveAnswer(answerId);
      showToast('Answer approved for posting', 'success');
      loadClusters();
    } catch (e) {
      if (e.message === 'rate_limit') {
        showToast('Rate limit hit, try again in 60s', 'warning');
      } else {
        showToast(e.message || 'Failed to approve answer', 'error');
      }
      setLoading(btn, false);
    }
  }

  function copyAnswer(answerId) {
    const el = document.getElementById(`answer-text-${answerId}`);
    if (!el) return;
    navigator.clipboard.writeText(el.textContent).then(() => {
      showToast('Answer copied to clipboard', 'success');
    }).catch(() => {
      showToast('Failed to copy', 'error');
    });
  }

  // ----------------------------------------------------------------
  // Stats
  // ----------------------------------------------------------------
  async function refreshStats() {
    if (!activeSession) return;
    try {
      const stats = await api.getSessionStats(activeSession.id);
      document.getElementById('stat-total').textContent = stats.total_comments ?? '—';
      document.getElementById('stat-questions').textContent = stats.questions ?? '—';
      document.getElementById('stat-clusters').textContent = stats.clusters ?? '—';
      document.getElementById('stat-posted').textContent = stats.answers_posted ?? '—';
    } catch (e) {
      // ignore
    }
  }

  // ----------------------------------------------------------------
  // WebSocket Event Handlers
  // ----------------------------------------------------------------
  function registerWebSocketHandlers() {
    dashboardWS.on('connected', () => {
      console.log('WebSocket connected');
    });

    dashboardWS.on('comment_created', (data) => {
      appendFeedItem(data);
      refreshStats();
    });

    dashboardWS.on('comment_classified', (data) => {
      updateFeedItemBadge(data.comment_id, data.is_question);
      refreshStats();
    });

    dashboardWS.on('cluster_created', (data) => {
      upsertClusterCard(data);
      refreshStats();
    });

    dashboardWS.on('cluster_updated', (data) => {
      upsertClusterCard(data);
      refreshStats();
    });

    dashboardWS.on('answer_ready', (data) => {
      loadClusters();
      showToast('New answer generated — review in Clusters panel', 'info');
    });

    dashboardWS.on('answer_posted', (data) => {
      loadClusters();
      refreshStats();
      showToast('Answer posted to YouTube!', 'success');
    });

    dashboardWS.on('error', (data) => {
      showToast(data.msg || 'Connection error', 'error');
    });
  }

  // ----------------------------------------------------------------
  // Utility
  // ----------------------------------------------------------------
  function escHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ----------------------------------------------------------------
  // Bootstrap
  // ----------------------------------------------------------------
  async function init() {
    // Handle auth expiry globally
    window.addEventListener('auth:expired', () => {
      currentUser = null;
      activeSession = null;
      dashboardWS.disconnect();
      showAuth();
      showLogin();
    });

    // Check for stored token
    const token = localStorage.getItem('token');
    if (token) {
      api.token = token;
      try {
        await initDashboard();
      } catch (e) {
        // Token invalid — show login
        localStorage.removeItem('token');
        api.token = null;
        showAuth();
        showLogin();
      }
    } else {
      showAuth();
      showLogin();
    }
  }

  // Start on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', init);

  // Public API
  return {
    handleLogin,
    handleRegister,
    logout,
    showLogin,
    showRegister,
    handleCreateSession,
    endSession,
    connectYouTube,
    disconnectYouTube,
    submitManualQuestions,
    approveAnswer,
    copyAnswer,
  };
})();

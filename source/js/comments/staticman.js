// Simple AJAX submit and UX for Staticman form
// Place this file in your theme's `source/js/staticman.js` so that url_for('js/staticman.js') resolves.

document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('staticman-form');
  if (!form) return;

  var statusEl = document.getElementById('sm-status');
  var submitBtn = document.getElementById('sm-submit');

  function showStatus(msg, isError) {
    if (!statusEl) return;
    statusEl.style.display = 'block';
    statusEl.style.color = isError ? 'red' : 'green';
    statusEl.textContent = msg;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.action) {
      showStatus('Staticman endpoint not configured. Please set theme.staticman.endpoint in _config.yml', true);
      return;
    }
    submitBtn.disabled = true;
    showStatus('Submitting comment...', false);

    // Serialize form to urlencoded body
    var formData = new FormData(form);
    var params = new URLSearchParams();
    formData.forEach(function (value, key) {
      params.append(key, value);
    });

    fetch(form.action, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    })
    .then(function (res) {
      // Some staticman instances return JSON, others redirect; we attempt to parse JSON safely
      return res.json().catch(function () {
        return { ok: res.ok, status: res.status };
      });
    })
    .then(function (json) {
      // Heuristics: staticman v2/v3 often returns JSON with commit info or options; otherwise check ok flag
      if ((json && (json.commit || json.options || json.ok)) || (json && json.status && json.status >= 200 && json.status < 300)) {
        showStatus('Comment submitted — it will appear after moderation / site rebuild.', false);
        form.reset();
      } else {
        showStatus('Submission seems to have failed. Response: ' + JSON.stringify(json), true);
      }
    })
    .catch(function (err) {
      showStatus('Submission error: ' + err.message, true);
    })
    .finally(function () {
      submitBtn.disabled = false;
    });
  });
});
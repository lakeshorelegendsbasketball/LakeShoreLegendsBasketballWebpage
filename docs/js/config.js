/* Where the booking API lives. Fill these in after deploying the Worker.
   Add ?api=staging to any page URL to use the test server for that tab
   (?api=production switches back). */
(function () {
  var APIS = {
    production: 'https://lsl-booking-api.coachgiopag.workers.dev',
    staging: 'https://lsl-booking-api-staging.coachgiopag.workers.dev',
    local: 'http://localhost:8787',
  };
  var local = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  var pick = local ? 'local' : 'production';
  try {
    var q = new URLSearchParams(location.search).get('api');
    if (q && APIS[q]) sessionStorage.setItem('lsl_api', q);
    pick = sessionStorage.getItem('lsl_api') || pick;
  } catch (e) { /* storage blocked: use the default */ }
  window.LSL_API = APIS[pick] || APIS.production;
  window.LSL_API_NAME = pick;
})();

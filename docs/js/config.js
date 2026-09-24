/* Where the booking API lives. Set PRODUCTION_API after deploying the Worker. */
(function () {
  var PRODUCTION_API = 'https://lsl-booking-api.REPLACE_ME.workers.dev';
  var local = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  window.LSL_API = local ? 'http://localhost:8787' : PRODUCTION_API;
})();

(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.PVGISClient = api;
})(typeof globalThis !== "undefined" ? globalThis : null, function () {
  "use strict";
  function buildRequest(proxyUrl, lat, lon, angle, aspect) {
    const url = new URL(proxyUrl);
    if (url.protocol !== "https:" || url.username || url.password) {
      throw new TypeError("PVGIS proxy must be a valid HTTPS URL without credentials.");
    }
    const values = [lat, lon, angle, aspect].map(Number);
    if (values.some(value => !Number.isFinite(value))) {
      throw new TypeError("PVGIS parameters must be finite numbers.");
    }
    const [latitude, longitude, inclination, azimuth] = values;
    if (latitude < 47.27 || latitude > 55.06 || longitude < 5.87 || longitude > 15.04 ||
        inclination < 0 || inclination > 90 || azimuth < -180 || azimuth > 180) {
      throw new RangeError("PVGIS parameters are outside the supported Germany bounds.");
    }
    url.search = new URLSearchParams({
      lat: String(latitude), lon: String(longitude),
      angle: String(inclination), aspect: String(azimuth)
    }).toString();
    return url;
  }
  function parseResponse(payload) {
    const annual = Number(payload?.annualYieldKwhPerKwp);
    const monthly = payload?.monthlyYieldKwhPerKwp;
    if (!Number.isFinite(annual) || annual <= 0 || !Array.isArray(monthly) ||
        monthly.length !== 12 || monthly.some(value => !Number.isFinite(Number(value)) || Number(value) < 0)) {
      throw new TypeError("PVGIS response does not contain a valid annual yield and 12 monthly values.");
    }
    return { annualYieldKwhPerKwp: annual, monthlyYieldKwhPerKwp: monthly.map(Number) };
  }
  return { buildRequest, parseResponse };
});

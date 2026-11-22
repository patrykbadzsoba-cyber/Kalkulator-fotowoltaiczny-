/**
 * PVGIS 5.3 proxy for the German PV calculator.
 * Requires an exact APP_ORIGIN and a Cloudflare PVGIS_RATE_LIMITER binding.
 */
const PVGIS_ENDPOINT = "https://re.jrc.ec.europa.eu/api/v5_3/PVcalc";
const GERMANY = { minLat: 47.27, maxLat: 55.06, minLon: 5.87, maxLon: 15.04 };

function json(data, status, origin, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": origin,
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "Content-Type",
      "vary": "Origin",
      "cache-control": "no-store",
      ...extraHeaders
    }
  });
}

export default {
  async fetch(request, env) {
    const allowedOrigin = env.APP_ORIGIN;
    const requestOrigin = request.headers.get("Origin");
    if (!allowedOrigin || requestOrigin !== allowedOrigin) {
      return new Response("Forbidden", { status: 403 });
    }
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "access-control-allow-origin": allowedOrigin,
          "access-control-allow-methods": "GET, OPTIONS",
          "access-control-allow-headers": "Content-Type",
          "access-control-max-age": "86400",
          "vary": "Origin"
        }
      });
    }
    if (request.method !== "GET") return json({ error: "Method not allowed" }, 405, allowedOrigin);

    const incoming = new URL(request.url);
    const required = ["lat", "lon", "angle", "aspect"];
    if (required.some((key) => {
      const value = incoming.searchParams.get(key);
      return value === null || value.trim() === "";
    })) {
      return json({ error: "Missing required PVGIS parameters" }, 400, allowedOrigin);
    }
    const lat = Number(incoming.searchParams.get("lat"));
    const lon = Number(incoming.searchParams.get("lon"));
    const angle = Number(incoming.searchParams.get("angle"));
    const aspect = Number(incoming.searchParams.get("aspect"));
    if (!Number.isFinite(lat) || lat < GERMANY.minLat || lat > GERMANY.maxLat ||
        !Number.isFinite(lon) || lon < GERMANY.minLon || lon > GERMANY.maxLon ||
        !Number.isFinite(angle) || angle < 0 || angle > 90 ||
        !Number.isFinite(aspect) || aspect < -180 || aspect > 180) {
      return json({ error: "Invalid PVGIS parameters for the supported Germany region" }, 400, allowedOrigin);
    }

    // Fail closed: do not call the public JRC API if rate limiting is not configured.
    if (!env.PVGIS_RATE_LIMITER || typeof env.PVGIS_RATE_LIMITER.limit !== "function") {
      return json({ error: "PVGIS rate limiter is not configured" }, 503, allowedOrigin);
    }
    const clientKey = request.headers.get("CF-Connecting-IP") || "unknown-client";
    try {
      const { success } = await env.PVGIS_RATE_LIMITER.limit({ key: clientKey });
      if (!success) {
        return json({ error: "Too many PVGIS requests. Please wait and try again." }, 429, allowedOrigin, { "retry-after": "60" });
      }
    } catch (_) {
      return json({ error: "PVGIS rate limiter is unavailable" }, 503, allowedOrigin);
    }

    const upstream = new URL(PVGIS_ENDPOINT);
    upstream.search = new URLSearchParams({
      lat: String(lat), lon: String(lon), peakpower: "1", loss: "14",
      angle: String(angle), aspect: String(aspect), usehorizon: "1",
      outputformat: "json"
    }).toString();

    try {
      const response = await fetch(upstream.toString(), {
        headers: { "accept": "application/json" },
        signal: AbortSignal.timeout(12000)
      });
      if (!response.ok) {
        return json({ error: "PVGIS upstream error", upstreamStatus: response.status }, 502, allowedOrigin);
      }
      let payload;
      try { payload = await response.json(); } catch (_) {
        return json({ error: "Invalid PVGIS response" }, 502, allowedOrigin);
      }
      const annual = Number(payload.outputs?.totals?.fixed?.E_y);
      const monthlyRows = payload.outputs?.monthly?.fixed;
      if (!Number.isFinite(annual) || annual <= 0 || !Array.isArray(monthlyRows) || monthlyRows.length !== 12) {
        return json({ error: "Incomplete PVGIS response" }, 502, allowedOrigin);
      }
      const monthly = monthlyRows.map(row => row?.E_m === null || row?.E_m === undefined || row?.E_m === "" ? NaN : Number(row.E_m));
      if (monthly.some(value => !Number.isFinite(value) || value < 0) || monthly.reduce((sum, value) => sum + value, 0) <= 0) {
        return json({ error: "Invalid PVGIS monthly values" }, 502, allowedOrigin);
      }
      return json({
        source: "PVGIS 5.3",
        annualYieldKwhPerKwp: annual,
        monthlyYieldKwhPerKwp: monthly,
        assumptions: { peakpowerKwp: 1, systemLossPercent: 14, angle, aspect, horizon: true }
      }, 200, allowedOrigin, {
        "cache-control": "public, max-age=3600, s-maxage=3600"
      });
    } catch (_) {
      return json({ error: "PVGIS request failed or timed out" }, 502, allowedOrigin);
    }
  }
};

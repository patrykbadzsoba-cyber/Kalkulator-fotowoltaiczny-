/**
 * PVGIS 5.3 proxy for the PV-Rechner static frontend.
 *
 * Deploy as a Cloudflare Worker and set APP_ORIGIN to the exact HTTPS
 * origin serving the calculator (for example, https://owner.github.io).
 * Do not enable wildcard CORS. The frontend must not call PVGIS directly:
 * the JRC explicitly disallows AJAX access to its API.
 */
const PVGIS_ENDPOINT = "https://re.jrc.ec.europa.eu/api/v5_3/PVcalc";

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": origin,
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "Content-Type",
      "vary": "Origin",
      "cache-control": "no-store"
    }
  });
}

export default {
  async fetch(request, env, ctx) {
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
    const lat = Number(incoming.searchParams.get("lat"));
    const lon = Number(incoming.searchParams.get("lon"));
    const angle = Number(incoming.searchParams.get("angle"));
    const aspect = Number(incoming.searchParams.get("aspect"));
    if (!Number.isFinite(lat) || lat < -90 || lat > 90 ||
        !Number.isFinite(lon) || lon < -180 || lon > 180 ||
        !Number.isFinite(angle) || angle < 0 || angle > 90 ||
        !Number.isFinite(aspect) || aspect < -180 || aspect > 180) {
      return json({ error: "Invalid PVGIS parameters" }, 400, allowedOrigin);
    }

    const upstream = new URL(PVGIS_ENDPOINT);
    upstream.search = new URLSearchParams({
      lat: String(lat),
      lon: String(lon),
      peakpower: "1",
      loss: "14",
      angle: String(angle),
      aspect: String(aspect),
      usehorizon: "1",
      outputformat: "json"
    }).toString();

    try {
      const cache = caches.default;
      const cacheKey = new Request(upstream.toString(), { method: "GET" });
      const cached = await cache.match(cacheKey);
      if (cached) {
        const headers = new Headers(cached.headers);
        headers.set("access-control-allow-origin", allowedOrigin);
        headers.set("vary", "Origin");
        return new Response(cached.body, { status: cached.status, headers });
      }
      const response = await fetch(upstream.toString(), {
        headers: { "accept": "application/json" },
        signal: AbortSignal.timeout(12000)
      });
      const body = await response.text();
      if (!response.ok) {
        return json({ error: "PVGIS upstream error", upstreamStatus: response.status }, 502, allowedOrigin);
      }
      let payload;
      try { payload = JSON.parse(body); } catch (_) {
        return json({ error: "Invalid PVGIS response" }, 502, allowedOrigin);
      }
      const annual = Number(payload.outputs?.totals?.fixed?.E_y);
      const monthly = payload.outputs?.monthly?.fixed;
      if (!Number.isFinite(annual) || annual <= 0 || !Array.isArray(monthly) || monthly.length !== 12) {
        return json({ error: "Incomplete PVGIS response" }, 502, allowedOrigin);
      }
      const result = new Response(JSON.stringify(payload), {
        status: 200,
        headers: {
          "content-type": "application/json; charset=utf-8",
          "access-control-allow-origin": allowedOrigin,
          "vary": "Origin",
          "cache-control": "public, max-age=3600"
        }
      });
      ctx.waitUntil(cache.put(cacheKey, result.clone()));
      return result;
    } catch (_) {
      return json({ error: "PVGIS request failed or timed out" }, 502, allowedOrigin);
    }
  }
};

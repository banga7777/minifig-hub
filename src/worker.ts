export default {
  async fetch(request: Request, env: { ASSETS: { fetch: (req: Request) => Promise<Response> } }) {
    // 1. Try to fetch the requested asset
    let response = await env.ASSETS.fetch(request);

    // 2. Prevent caching for HTML files to ensure users get the latest version
    if (response.headers.get('content-type')?.includes('text/html')) {
      const newHeaders = new Headers(response.headers);
      newHeaders.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      newHeaders.set('Pragma', 'no-cache');
      newHeaders.set('Expires', '0');
      response = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
    }

    return response;
  }
};

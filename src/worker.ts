export default {
  async fetch(request: Request, env: { ASSETS: { fetch: (req: Request) => Promise<Response> } }) {
    const url = new URL(request.url);
    
    // 1. Try to fetch the requested asset
    let response = await env.ASSETS.fetch(request);

    // 2. If the asset is not found (404) and it's not an API or asset request, serve index.html
    if (response.status === 404 && !url.pathname.startsWith('/assets/')) {
      const indexRequest = new Request(new URL('/index.html', request.url), {
        method: 'GET',
        headers: request.headers
      });
      const indexResponse = await env.ASSETS.fetch(indexRequest);
      response = new Response(indexResponse.body, {
        status: 200,
        headers: indexResponse.headers
      });
    }

    // 3. Prevent caching for HTML files to ensure users get the latest version
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
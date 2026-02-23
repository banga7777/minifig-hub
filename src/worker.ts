export default {
  async fetch(request: Request, env: any) {
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
      return new Response(indexResponse.body, {
        status: 200,
        headers: indexResponse.headers
      });
    }

    return response;
  }
};

import handleRequest from "./handler";
import { Env } from "./types";

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    if (request.method === "OPTIONS") {
      // Return a response with the necessary CORS headers
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*", // Or '*', or your specific origin
          "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400", // Cache preflight response for 24 hours
        },
      });
    }

    let response;
    try {
      response = await handleRequest(request, env, ctx);
    } catch (e) {
      response = new Response("Internal Server Error", { status: 500 });
    }

    // Add CORS headers to the response
    const headers = new Headers(response.headers);
    headers.set("Access-Control-Allow-Origin", "*"); // Or '*', or your specific origin
    headers.set("Access-Control-Allow-Methods", "GET, HEAD, POST, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type");
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
} satisfies ExportedHandler<Env>;

import { IRequest, IttyRouter, IttyRouterType } from "itty-router";
import { Env } from "./types";
import { deleteAll, getRank, guess, initPlayer } from "./apis";

const handleRequest = async (
  request: Request,
  env: Env,
  ctx: ExecutionContext
) => {
  const router: IttyRouterType = IttyRouter();

  router.post("/init-player", (request) =>
    initPlayer(request as IRequest, env)
  );

  router.post("/guess", (request) => guess(request as IRequest, env));

  router.get("/get-rank", (request) => getRank(request as IRequest, env));

  router.delete("/delete-all", (request) =>
    deleteAll(request as IRequest, env)
  );

  router.all("*", () => new Response("Invalid URL", { status: 404 }));

  try {
    return await router.fetch(request);
  } catch (e) {
    return new Response(JSON.stringify(e), {
      status: 500,
    });
  }
};

export default handleRequest;

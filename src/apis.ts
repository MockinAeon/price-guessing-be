import { IRequest } from "itty-router";
import { Env } from "./types";

const validItems = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const items: { [key: string]: number } = {
  "1": 6.99,
  "2": 44.99,
  "3": 14.99,
  "4": 40.49,
  "5": 9.59,
  "6": 4.49,
  "7": 9.99,
  "8": 1.89,
  "9": 15.99,
  "10": 19.99,
  "11": 7.39,
  "12": 7.99,
};

function getPrefix(): string {
  const currentDate = new Date();

  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Month is 0-based, so add 1
  const day = String(currentDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}-`;
}

export const initPlayer = async (request: IRequest, env: Env) => {
  try {
    const body: any = await request.json();
    const name = body.name;

    if (!!!name) {
      return new Response(`请输入姓名`, {
        status: 400,
      });
    }
    const playerKey = `${getPrefix()}${name.trim().replace(/ /g, "-")}`;

    const player = await env.PLAYER.get(playerKey);
    if (player) {
      return new Response(`玩家已存在`, {
        status: 400,
      });
    }

    await env.PLAYER.put(playerKey, JSON.stringify({}));

    return new Response(`Body received: ${JSON.stringify(body)}`, {
      status: 200,
    });
  } catch (e) {
    return new Response(`Error: invalid input`, {
      status: 500,
    });
  }
};

export const guess = async (request: IRequest, env: Env) => {
  try {
    const body: any = await request.json();
    const { item, price, name } = body;

    if (!validItems.includes(item)) {
      return new Response(`Invalid item`, {
        status: 400,
      });
    }

    const playerKey = `${getPrefix()}${name.trim().replace(/ /g, "-")}`;
    const value = await env.PLAYER.get(playerKey);

    if (!value) {
      return new Response(`Invalid user`, {
        status: 400,
      });
    }

    // validation check
    const jsonValue = JSON.parse(value!);

    if (jsonValue[item]) {
      return new Response(`一个物品只能竞猜一次`, {
        status: 400,
      });
    }

    await env.PLAYER.put(
      playerKey,
      JSON.stringify({
        ...jsonValue,
        [item]: price,
      })
    );

    return new Response(`Body received: ${JSON.stringify(body)}`, {
      status: 200,
    });
  } catch (e) {
    return new Response(`Error: ${JSON.stringify(e)}`, {
      status: 500,
    });
  }
};

function computeAbsoluteDeltaSum(guessedPrice: {
  [key: string]: number;
}): number {
  // Initialize the sum of absolute deltas
  let deltaSum = 0.0;

  // Iterate through all keys in truePrice
  for (const key in items) {
    if (guessedPrice.hasOwnProperty(key)) {
      // Compute the absolute difference if the key exists in guessedPrice
      deltaSum += Math.abs(items[key] - guessedPrice[key]);
    } else {
    }
  }

  return Number(deltaSum.toFixed(2));
}

export const getRank = async (request: IRequest, env: Env) => {
  const playerList = await env.PLAYER.list({ prefix: getPrefix() });
  const players = playerList.keys.map((key) => key.name);

  const results: object[] = [];
  for (const player of players) {
    const value = await env.PLAYER.get(player);
    const jsonValue = JSON.parse(value!);
    const calculatedValue = computeAbsoluteDeltaSum(jsonValue);
    console.log("value", {
      name: player,
      value: calculatedValue,
    }); // This will now log as expected
    results.push({
      name: player.replaceAll(getPrefix(), ""),
      value: calculatedValue,
      counts: Object.keys(jsonValue).length,
    });
  }

  return new Response(`${JSON.stringify(results)}`, {
    status: 200,
  });
};

export const deleteAll = async (request: IRequest, env: Env) => {
  const playerList = await env.PLAYER.list({ prefix: getPrefix() });
  const players = playerList.keys.map((key) => key.name);
  for (const player of players) {
    await env.PLAYER.delete(player);
  }
};

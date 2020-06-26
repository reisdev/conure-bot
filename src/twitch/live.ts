import WebHookListener from "twitch-webhooks";

import { twitchClient } from './index'

const listener = await WebHookListener.create(twitchClient, { port: 8090 });
listener.listen();
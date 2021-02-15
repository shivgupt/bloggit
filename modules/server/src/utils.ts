import pino from "pino";

import { env } from "./env";

export const wait = (ms: number): Promise<void> => new Promise(res => setTimeout(res, ms));

export const logger = pino({ level: env.logLevel });

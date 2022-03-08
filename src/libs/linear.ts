import { LinearClient } from "@linear/sdk";

const apiKey = process.env.LINEAR_API_KEY;

export const READY_STATE_ID = process.env.LINEAR_READY_STATE_ID;
export const DONE_STATE_ID = process.env.LINEAR_DONE_STATE_ID;

export const ENGINEERING_LABEL_ID = process.env.LINEAR_ENGINEERING_LABEL_ID;

export const linearClient = new LinearClient({ apiKey });

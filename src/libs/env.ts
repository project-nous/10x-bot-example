import * as assert from "assert";

const assertEnv = (key: string): string => {
  const value = process.env[key];
  assert.ok(value);
  return value;
};

// You remembered to set these, right?
export const LINEAR_API_KEY = assertEnv("LINEAR_API_KEY");
export const READY_STATE_ID = assertEnv("LINEAR_READY_STATE_ID");
export const DONE_STATE_ID = assertEnv("LINEAR_DONE_STATE_ID");
export const ENGINEERING_LABEL_ID = assertEnv("LINEAR_ENGINEERING_LABEL_ID");
export const GITHUB_WEBHOOK_SECRET = assertEnv("GITHUB_WEBHOOK_SECRET");

import schema from "./schema";
import { Webhooks, EmitterWebhookEventName } from "@octokit/webhooks";
import {
  formatJSONResponse,
  ValidatedEventAPIGatewayProxyEvent,
} from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";

const github = new Webhooks({
  secret: process.env.GITHUB_WEBHOOK_SECRET,
});

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  await github.verifyAndReceive({
    id: event.headers["x-github-delivery"],
    name: event.headers["x-github-event"] as EmitterWebhookEventName,
    payload: event.body,
    signature: event.headers["x-hub-signature-256"],
  });

  return formatJSONResponse({
    message: "GitHub webhook received, verified, and handled.",
    event,
  });
};

export const main = middyfy(handler);

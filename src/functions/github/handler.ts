import schema from "./schema";
import { Webhooks, EmitterWebhookEventName } from "@octokit/webhooks";
import {
  formatJSONResponse,
  ValidatedEventAPIGatewayProxyEvent,
} from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import {
  DONE_STATE_ID,
  ENGINEERING_LABEL_ID,
  linearClient,
  READY_STATE_ID,
} from "@libs/linear";

const github = new Webhooks({
  secret: process.env.GITHUB_WEBHOOK_SECRET,
});

github.on("push", async ({ payload: { ref, repository } }) => {
  if (ref === "refs/heads/production" && repository.name === "monorepo") {
    let issues = await linearClient.issues({
      filter: {
        state: {
          id: {
            eq: READY_STATE_ID,
          },
        },
        labels: {
          id: {
            eq: ENGINEERING_LABEL_ID,
          },
        },
      },
    });

    while (issues.nodes.length) {
      const ids = issues.nodes.map((issue) => issue.id);
      await linearClient.issueBatchUpdate(ids, { stateId: DONE_STATE_ID });

      if (issues.pageInfo.hasNextPage) {
        issues = await issues.fetchNext();
      }
    }
  }
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

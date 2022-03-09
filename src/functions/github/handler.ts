import schema from "./schema";
import * as assert from "assert";
import { Webhooks, EmitterWebhookEventName } from "@octokit/webhooks";
import {
  formatJSONResponse,
  ValidatedEventAPIGatewayProxyEvent,
} from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import {
  DONE_STATE_ID,
  ENGINEERING_LABEL_ID,
  READY_STATE_ID,
  GITHUB_WEBHOOK_SECRET,
  LINEAR_API_KEY,
} from "@libs/env";
import { LinearClient } from "@linear/sdk";

const github = new Webhooks({
  secret: GITHUB_WEBHOOK_SECRET,
});

export const linear = new LinearClient({ apiKey: LINEAR_API_KEY });

github.on("push", async ({ payload: { ref, repository } }) => {
  // INSERT YOUR OWN LOGIC BELOW 👇
  if (ref === "refs/heads/MY_PRODUCTION_BRANCH" && repository.name === "MY_REPO_NAME") {
    let issues = await linear.issues({
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
      await linear.issueBatchUpdate(ids, { stateId: DONE_STATE_ID });

      if (issues.pageInfo.hasNextPage) {
        issues = await issues.fetchNext();
      }
    }
  }
});

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  const { headers, body: payload } = event;
  const id = headers["x-github-delivery"];
  const name = headers["x-github-event"] as EmitterWebhookEventName;
  const signature = headers["x-hub-signature-256"];

  // These headers should be set, fall over if they're not.
  // (you might want to 400 here instead...)
  assert.ok(id);
  assert.ok(name);
  assert.ok(signature);

  await github.verifyAndReceive({
    id,
    name,
    payload,
    signature,
  });

  return formatJSONResponse({
    message: "GitHub webhook received, verified, and handled.",
    event,
  });
};

export const main = middyfy(handler);

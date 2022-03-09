import type { AWS } from "@serverless/typescript";

import github from "@functions/github";

const serverlessConfiguration: AWS = {
  service: "service-10x-bot-example",
  frameworkVersion: "3",
  plugins: ["serverless-esbuild"],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
      GITHUB_WEBHOOK_SECRET: "${ssm:/github/webhook-secret}",
      LINEAR_API_KEY: "${ssm:/linear/api-key}",
      LINEAR_READY_STATE_ID: "${ssm:/linear/ready-state-id}",
      LINEAR_DONE_STATE_ID: "${ssm:/linear/done-state-id}",
      LINEAR_ENGINEERING_LABEL_ID: "${ssm:/linear/engineering-label-id}",
    },
  },
  // import the function via paths
  functions: { hello, github },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node14",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;

import middy from "@middy/core";
import middyJsonBodyParser from "@middy/http-json-body-parser";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import { Handler as LambdaHandler } from "aws-lambda";

export const middyfy = (handler: LambdaHandler) => {
  return middy(handler).use(middyJsonBodyParser()).use(httpHeaderNormalizer());
};

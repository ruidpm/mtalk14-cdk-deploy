#!/usr/bin/env node
import { App, Duration, Stack } from "aws-cdk-lib";
import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Topic } from "aws-cdk-lib/aws-sns";

import path = require("path");

const app = new App();

const topicNotificationsStack = new Stack(app, "NotificationsStack");

const newsTopic = new Topic(topicNotificationsStack, "NewsTopic", {
  topicName: "NewsTopic",
});

const api = new RestApi(topicNotificationsStack, "NewsApi");

const addSubscriptionLambda = new NodejsFunction(
  topicNotificationsStack,
  "addSubscriptionLambda",
  {
    runtime: Runtime.NODEJS_18_X,
    timeout: Duration.seconds(30),
    memorySize: 512,
    bundling: {
      minify: true,
    },
    handler: "addSubscriptionLambdaHandler",
    entry: path.join(__dirname, "../src/addSubscriptionLambdaHandler.ts"),
    environment: {
      NEWS_TOPIC: newsTopic.topicArn,
    },
  }
);

addSubscriptionLambda.addPermission({
  Statement: [
    {
      Effect: "Allow",
      Action: ["sns:Publish", "sns:Subscribe"],
      Resource: "arn:aws:sns:your_region:123456789012:YourTopicName",
    },
  ],
});

const publishNewsLambda = new NodejsFunction(
  topicNotificationsStack,
  "publishNewsLambda",
  {
    runtime: Runtime.NODEJS_18_X,
    timeout: Duration.seconds(30),
    memorySize: 512,
    bundling: {
      minify: true,
    },
    handler: "publishNewsLambdaHandler",
    entry: path.join(__dirname, "../src/publishNewsLambdaHandler.ts"),
    environment: {
      NEWS_TOPIC: newsTopic.topicArn,
    },
  }
);

newsTopic.grantPublish(publishNewsLambda);

const newsResource = api.root.addResource("news");
const publishResource = api.root.addResource("publish");

newsResource.addMethod("POST", new LambdaIntegration(addSubscriptionLambda));
publishResource.addMethod("POST", new LambdaIntegration(publishNewsLambda));

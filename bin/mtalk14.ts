#!/usr/bin/env node
import { App, CfnOutput, Duration, RemovalPolicy, Stack } from "aws-cdk-lib";
import {
  AwsIntegration,
  PassthroughBehavior,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { AttributeType, StreamViewType, Table } from "aws-cdk-lib/aws-dynamodb";
import { Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Runtime, StartingPosition } from "aws-cdk-lib/aws-lambda";
import { DynamoEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import path = require("path");

import "source-map-support/register";

const app = new App();

const MTalk14Stack = new Stack(app, "mtalk-14");

const todoTable = new Table(MTalk14Stack, "todo-table", {
  tableName: "todoTable",
  removalPolicy: RemovalPolicy.DESTROY,
  partitionKey: {
    type: AttributeType.STRING,
    name: "todo",
  },
  stream: StreamViewType.NEW_IMAGE,
});

const todoApi = new RestApi(MTalk14Stack, "todo-api", {
  defaultCorsPreflightOptions: {
    allowOrigins: ["*"],
  },
});

const integrationRole = new Role(MTalk14Stack, "IntegrationRole", {
  assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
});

todoTable.grantWriteData(integrationRole);

const dynamoPutIntegration = new AwsIntegration({
  service: "dynamodb",
  action: "PutItem",
  options: {
    passthroughBehavior: PassthroughBehavior.WHEN_NO_TEMPLATES,
    credentialsRole: integrationRole,
    requestTemplates: {
      "application/json": JSON.stringify({
        TableName: todoTable.tableName,
        Item: {
          todo: { S: "$input.path('$.todo')" },
        },
      }),
    },
    integrationResponses: [
      {
        statusCode: "200",
        responseTemplates: {
          "application/json": JSON.stringify({
            message: "Todo added to database",
          }),
        },
      },
    ],
  },
});

new CfnOutput(MTalk14Stack, "apiOutput", { value: todoApi.url });

const todoResource = todoApi.root.addResource("todo");

todoResource.addMethod("POST", dynamoPutIntegration, {
  methodResponses: [{ statusCode: "200" }],
});

const todoLambda = new NodejsFunction(MTalk14Stack, "todoLambda", {
  runtime: Runtime.NODEJS_18_X,
  handler: "todoLambdaHandler",
  entry: path.join(__dirname, "../src/todoLambdaHandler.ts"),
  timeout: Duration.seconds(30),
  memorySize: 128,
  bundling: {
    minify: true,
  },
});

todoLambda.addEventSource(
  new DynamoEventSource(todoTable, {
    startingPosition: StartingPosition.LATEST,
  })
);

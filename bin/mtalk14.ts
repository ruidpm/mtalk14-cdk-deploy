#!/usr/bin/env node
import { App, Stack } from "aws-cdk-lib";
import { Topic } from "aws-cdk-lib/aws-sns";

import path = require("path");

const app = new App();

const topicNotificationsStack = new Stack(app, "NotificationsStack");

const newsTopic = new Topic(topicNotificationsStack, "NewsTopic", {
  topicName: "NewsTopic",
});

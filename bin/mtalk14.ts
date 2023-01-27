#!/usr/bin/env node
import { App, Stack } from "aws-cdk-lib";
import "source-map-support/register";

const app = new App();

const MTalk14Stack = new Stack(app, "mtalk-14");

#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { WorkspacesDemoStack } from '../lib/workspaces-demo-stack';

const WorkspacesDemoEnv = { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION};
const app = new cdk.App();
new WorkspacesDemoStack(app, 'WorkspacesDemoStack', {env: WorkspacesDemoEnv});

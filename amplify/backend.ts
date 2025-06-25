import { defineBackend } from "@aws-amplify/backend";
import { Stack } from "aws-cdk-lib";
import { Policy, PolicyStatement, Effect } from "aws-cdk-lib/aws-iam";
import { StartingPosition, EventSourceMapping } from "aws-cdk-lib/aws-lambda";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { myDynamoDBFunction } from "./functions/dynamoDB-function/resource";
import { myApiFunction } from "./functions/api-functions/resource";
import {
  AuthorizationType,
  CognitoUserPoolsAuthorizer,
  Cors,
  LambdaIntegration,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";

const backend = defineBackend({
  auth,
  data,
  myDynamoDBFunction,
  myApiFunction,
});

// API -------------------------------------------------------------------
const apiStack = backend.createStack("api-stack");
const myRestApi = new RestApi(apiStack, "RestApi", {
  restApiName: "NoteAppAPI",
  deploy: true,
  deployOptions: {
    stageName: "dev",
  },
  defaultCorsPreflightOptions: {
    allowOrigins: Cors.ALL_ORIGINS,
    allowMethods: Cors.ALL_METHODS,
    allowHeaders: Cors.DEFAULT_HEADERS,
  },
});

const lambdaIntegration = new LambdaIntegration(
  backend.myApiFunction.resources.lambda
);

const itemsPath = myRestApi.root.addResource("notes", {
  defaultMethodOptions: {
    authorizationType: AuthorizationType.NONE,
  },
});

itemsPath.addMethod("GET", lambdaIntegration);
itemsPath.addMethod("POST", lambdaIntegration);
itemsPath.addMethod("DELETE", lambdaIntegration);
itemsPath.addMethod("PUT", lambdaIntegration);

itemsPath.addProxy({
  anyMethod: true,
  defaultIntegration: lambdaIntegration,
});



const apiRestPolicy = new Policy(apiStack, "RestApiPolicy", {
  statements: [
    new PolicyStatement({
      actions: ["execute-api:Invoke"],
      resources: [
        `${myRestApi.arnForExecuteApi("*", "/notes", "dev")}`,
        `${myRestApi.arnForExecuteApi("*", "/notes/*", "dev")}`,
      ],
    }),
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["dynamodb:Scan"],
      resources: [
        "*",
        "arn:aws:dynamodb:us-east-1:575108932136:table/Note-pqrdo5giangjlmyusxk2as64hm-NONE",
      ],
    }),
  ],
});

backend.myApiFunction.resources.lambda.role?.attachInlinePolicy(apiRestPolicy);

backend.addOutput({
  custom: {
    API: {
      [myRestApi.restApiName]: {
        endpoint: myRestApi.url,
        region: Stack.of(myRestApi).region,
        apiName: myRestApi.restApiName,
      },
    },
  },
});

// -------------------------------------------------------------------
const NoteTable = backend.data.resources.tables["Note"];

const policy = new Policy(
  Stack.of(NoteTable),
  "MyDynamoDBFunctionStreamingPolicy",
  {
    statements: [
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          "dynamodb:DescribeStream",
          "dynamodb:GetRecords",
          "dynamodb:GetShardIterator",
          "dynamodb:ListStreams",
        ],
        resources: ["*"],
      }),
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["cognito-idp:AdminGetUser"],
        resources: [
          "arn:aws:cognito-idp:us-east-1:575108932136:userpool/us-east-1_9SeYRRmOD",
        ],
      }),
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["ses:SendEmail"],
        resources: ["arn:aws:ses:us-east-1:575108932136:identity/*"],
      }),
    ],
  }
);

backend.myDynamoDBFunction.resources.lambda.role?.attachInlinePolicy(policy);

const mapping = new EventSourceMapping(
  Stack.of(NoteTable),
  "MyDynamoDBFunctionTodoEventStreamMapping",
  {
    target: backend.myDynamoDBFunction.resources.lambda,
    eventSourceArn: NoteTable.tableStreamArn,
    startingPosition: StartingPosition.LATEST,
  }
);

mapping.node.addDependency(policy);

import { APIGatewayEvent } from "aws-lambda";
import { SNS } from "aws-sdk";

export const addSubscriptionLambdaHandler = async (event: APIGatewayEvent) => {
  let body;

  if (event.body) {
    body = JSON.parse(event.body);
  }

  const topicArn = process.env.NEWS_TOPIC as string;

  const params = {
    Protocol: "EMAIL",
    TopicArn: topicArn,
    // @ts-ignore
    Endpoint: body.email,
  };

  const sns = new SNS();
  await sns.subscribe(params).promise();

  return "Added";
};

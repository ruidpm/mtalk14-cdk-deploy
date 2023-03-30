import { APIGatewayEvent } from "aws-lambda";
import { SNS } from "aws-sdk";

type PublishNews = {
  message: string;
};

export const addSubscriptionLambdaHandler = async (event: APIGatewayEvent) => {
  const body = event.body as unknown as PublishNews;
  const topicArn = process.env.NEWS_TOPIC as string;

  console.log(topicArn);

  const params = {
    TopicArn: topicArn,
    Message: body.message,
  };

  console.log(JSON.stringify(params));
  const sns = new SNS();
  await sns.publish(params).promise();

  return JSON.stringify({ body: "Published" });
};

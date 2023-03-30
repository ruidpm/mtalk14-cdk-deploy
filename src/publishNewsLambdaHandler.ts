import { APIGatewayEvent } from "aws-lambda";
import { SNS } from "aws-sdk";

type PublishNews = {
  message: string;
};

export const publishNewsLambdaHandler = async (event: APIGatewayEvent) => {
  let body: PublishNews = { message: "oops" };
  if (event.body) body = JSON.parse(event.body);

  const topicArn = process.env.NEWS_TOPIC as string;

  const params = {
    TopicArn: topicArn,
    Message: body.message,
    Subject: "School News",
  };
  console.log(JSON.stringify(params));
  const sns = new SNS();
  await sns.publish(params).promise();

  return JSON.stringify({ body: "Published" });
};

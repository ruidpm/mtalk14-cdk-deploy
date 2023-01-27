import { DynamoDB } from "aws-sdk";

//@ts-ignore
export const todoLambdaHandler = async (event) => {
  //@ts-ignore
  const todo: string = DynamoDB.Converter.unmarshall(
    event.Records[0].dynamodb!.NewImage!
  ).email;

  console.log(`New todo created: ${todo}`);
};

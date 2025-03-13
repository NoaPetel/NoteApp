import type { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDB } from "aws-sdk";

const dynamoDb = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || "Note"; 


export const handler: APIGatewayProxyHandler = async (event) => {
  console.log("event", event);
  return {
    statusCode: 200,
    // Modify the CORS settings below to match your specific requirements
    headers: {
      "Access-Control-Allow-Origin": "*", // Restrict this to domains you trust
      "Access-Control-Allow-Headers": "*", // Specify only the headers you need to allow
    },
    body: JSON.stringify("Hello from myFunction!"),
  };
};

// export const handler: APIGatewayProxyHandler = async (event) => {
//   console.log("Received event:", event);

//   try {
//     const params = {
//       TableName: TABLE_NAME,
//     };

//     const result = await dynamoDb.scan(params).promise(); 

//     return {
//       statusCode: 200,
//       headers: {
//         "Access-Control-Allow-Origin": "*",
//         "Access-Control-Allow-Headers": "*",
//       },
//       body: JSON.stringify(result.Items),
//     };
//   } catch (error) {
//     console.error("Error fetching notes:", error);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ message: "Error fetching notes : test" }),
//     };
//   }
// };

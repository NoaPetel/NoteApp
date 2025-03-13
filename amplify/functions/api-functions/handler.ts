import type { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDB } from "aws-sdk";

const dynamoDb = new DynamoDB.DocumentClient({
  region: "us-east-1"
});
const TABLE_NAME = process.env.TABLE_NAME || "Note-pqrdo5giangjlmyusxk2as64hm-NONE"; 

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log("Received event:", event);

  try {

    if(event.httpMethod !== "GET" || event.path !== "/notes"){
      return {statusCode: 404, body: "Not Found"};
    }
    
    const params = {
      TableName: TABLE_NAME,
    };

    const result = await dynamoDb.scan(params).promise(); 

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
      },
      body: JSON.stringify(result.Items),
    };
  } catch (error) {
    console.error("Error fetching notes:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error fetching notes"}),
    };
  }
};

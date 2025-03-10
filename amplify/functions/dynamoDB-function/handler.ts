import type { APIGatewayProxyEvent, DynamoDBStreamEvent, DynamoDBStreamHandler } from "aws-lambda";
import { Logger } from "@aws-lambda-powertools/logger";

const logger = new Logger({
  logLevel: "INFO",
  serviceName: "dynamodb-stream-handler",
});

import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { CognitoIdentityProvider, AdminGetUserCommand } from "@aws-sdk/client-cognito-identity-provider";

const sesClient = new SESClient({});
const cognitoClient = new CognitoIdentityProvider({});

export const handler = async (event: DynamoDBStreamEvent) => {
  console.log("Event received:", JSON.stringify(event, null, 2));
  for (const record of event.Records) {
    if (record.eventName === "REMOVE") {
      try {
        const username = record.dynamodb?.OldImage?.owner.S?.split("::")[0];
        const title = record.dynamodb?.OldImage?.title.S ?? "";
        const id = record.dynamodb?.OldImage?.id.S ?? "";

        const input = {
          UserPoolId: "us-east-1_9SeYRRmOD",
          Username: username,
        };
        const command = new AdminGetUserCommand(input);
        const response = await cognitoClient.send(command);
        console.log("User", response);
        
        const emailAttribute = response.UserAttributes?.find((attr) => attr.Name === "email");
        if(!emailAttribute){
          console.error("No email found in the user attributes.")
          continue;
        }

        
        const email = emailAttribute.Value ?? "";
        console.log("Email:", email);
        const emailResponse = await sendEmail(email, title, id);
        console.log("Email sent:", emailResponse);

      } catch (err) {
        console.error("Error looking up user email:", err);
      }
    } else {
      console.error("No owner ID found in the deleted note.");
    }
  }


  return { statusCode: 200, body: "Success" };
};

export const sendEmail = async (email: string, title: string, id: string) => {

  const emailToSend = {
    Source: "noa@dattico.com", // Sender email (must be verified in SES)
    Destination: {
      ToAddresses: [email], // Recipient email
    },
    Message: {
      Subject: {
        Data: "Note (id: " + id + ") Deletion Alert", // Email subject
      },
      Body: {
        Text: {
          Data: `Your note with ID ${id} and title "${title}" has been deleted.`, // Plain text email body
        },
        Html: {
          Data: `<html>
          <body >
            <p>Your note with ID ${id} and title ${title} has been deleted.</p>
          </body>
        </html>`, // HTML email body
        },
      },
    },
  };

  const command = new SendEmailCommand(emailToSend);
  const response = await sesClient.send(command);
  return response;
};

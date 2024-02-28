// Create clients and set shared const values outside of the handler.

// Create a DocumentClient that represents the query to add an item
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

// Get the DynamoDB table name from environment variables
const tableName = process.env.tableName;

/**
 * A simple example includes a HTTP post method to add one item to a DynamoDB table.
 */
export const createUserHandler = async (event) => {
  try{
    if (event.httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
    }
    // All log statements are written to CloudWatch
    console.info('received:', event);

    // Get id and name from the body of the request
    const body = JSON.parse(event.body);
    const id = body.id;
    const emailID = body.emailID;
    const password = body.password;
    const displayName = body.displayName;
    const teamRole = body.teamRole;
    const teamID = body.teamID;

    // Creates a new item, or replaces an old item with a new item
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property
    var params = {
        TableName: tableName,
        Item: { "user-id": id, emailID: emailID, password: password, displayName: displayName, teamRole: teamRole, teamID: teamID }
    };
        const data = await ddbDocClient.send(new PutCommand(params));
        console.log("Success - item added or updated", data); 
    const response = {
        statusCode: 200,
        body: JSON.stringify(body)
    };
  }  catch (error) {
    console.error("Error in createUserHandler:", error);

    let errorMessage;
    let statusCode;

    if (error.message === "Missing required data in request body.") {
      errorMessage = "Required data missing in request body";
      statusCode = 400; // Bad Request
    } else {
      errorMessage = "Failed to create user";
      statusCode = 500; // Internal Server Error
    }

    return {
      statusCode,
      body: JSON.stringify({ error: errorMessage }),
    };
  }

  // All log statements are written to CloudWatch
  console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
  return response;
};
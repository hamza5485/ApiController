const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const dynamo = new AWS.DynamoDB.DocumentClient();

const headers = {
    "Content-Type": "application/json"
};

exports.handler = async (event) => {
    let body;
    let statusCode = 200;

    try {
        const tableName = event.rawPath.split('/')[1];
        switch (event.routeKey) {
            case `GET /${tableName}`:
                body = await listItems(tableName);
                break;
            case `GET /${tableName}/{id}`:
                body = await getItem(tableName, event.pathParameters.id);
                break;
            case `POST /${tableName}`:
                let item = JSON.parse(event.body);
                await createItem(tableName, item);
                statusCode = 201;
                break;
            default:
                throw new Error(`Unsupported route: "${event.routeKey}"`);
        }
    } catch (err) {
        statusCode = 400;
        body = err.message;
    } finally {
        body = JSON.stringify(body);
    }
    
    return {
        statusCode,
        body,
        headers
    };
};

const listItems = async (tableName) => {
    const data = await dynamo.scan({
        TableName: tableName
    }).promise();
    return data;
};

const getItem = async (tableName, id) => {
    const data = await dynamo.get({
        TableName: tableName,
        Key: { id: id }
    }).promise();
    return data;
};

const createItem = async (tableName, item) => {
    item.id = uuidv4();
    await dynamo.put({
        TableName: tableName,
        Item: item
    }).promise();
};
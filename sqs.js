const AWS = require("aws-sdk");

// sendMerchantJsonToSqs();
// sendShipJsonToSqs()
// sendSalesJsonToSqs()

async function sendMerchantJsonToSqs() {
  try {
    const data = require("./MERCHANT_ORDER.json");
    putMessagetoQueue(JSON.stringify(data));
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

async function sendShipJsonToSqs() {
  try {
    const data = require("./SHIPPING_ORDER.json");

    putMessagetoQueue(JSON.stringify(data));
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

async function sendSalesJsonToSqs() {
  try {
    const data = require("./SALES_ORDER.json");

    putMessagetoQueue(JSON.stringify(data));
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

async function putMessagetoQueue(messageBody) {
  try {
    const sqs = new AWS.SQS();
    let queueURL = "https://sqs.us-east-2.amazonaws.com/083868342691/testtlog";

    const params = {
      MessageBody: messageBody,
      QueueUrl: queueURL,
      DelaySeconds: 0,
    };
    if (queueURL.includes("fifo")) {
      params["MessageGroupId"] = generateUUID();
      params["MessageDeduplicationId"] = generateUUID();
    }
    await sqs.sendMessage(params).promise();
    console.log("data to sqs sent");
  } catch (error) {
    console.error(`${error.message}: ${error.stack}`);
    throw error;
  }
}

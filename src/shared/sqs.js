const AWS = require("aws-sdk");

// sendMerchantJsonToSqs();
// sendShipJsonToSqs()
// sendSalesJsonToSqs()
sendreturnJsonToSqs()

async function sendMerchantJsonToSqs() {
  try {
    const data = require("../jsonfiles/MERCHANT_ORDER.json");
    putMessagetoQueue(JSON.stringify(data));
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

async function sendShipJsonToSqs() {
  try {
    const data = require("../jsonfiles/SHIPPING_ORDER.json");

    putMessagetoQueue(JSON.stringify(data));
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

async function sendSalesJsonToSqs() {
  try {
    const data = require("../jsonfiles/SALES_ORDER.json");

    putMessagetoQueue(JSON.stringify(data));
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}


async function sendreturnJsonToSqs() {
  try {
    const data = require("../jsonfiles/RETURN.json");

    putMessagetoQueue(JSON.stringify(data));
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

async function putMessagetoQueue(messageBody) {
  try {
    const sqs = new AWS.SQS();
    let queueURL = "https://sqs.us-east-2.amazonaws.com/083868342691/my-test1-queue-dev"

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

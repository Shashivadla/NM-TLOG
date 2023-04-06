const { v4 } = require("uuid");
const moment = require("moment-timezone");
const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();

async function insertActivity(pkey, data) {
  try {
    console.log(pkey);
    let pKey = pkey;
    let sKey = `STAGES#${v4()}`;
    console.log(sKey);
    let lastUpdateTime = getCstDate();
    let lastUpdateTime1 = JSON.stringify(lastUpdateTime);
    let expiration = await getUnixExpiration(lastUpdateTime);
    let expiration1 = JSON.stringify(expiration);
    console.log(expiration);
    let params = {
      TableName: process.env.ACTIVITY_TABLE,
      Item: {
        ...data,
        pKey,
        sKey,
        lastUpdateTime1,
        expiration1,
      },
    };
    console.log("params", params);
    await dynamodb.put(params).promise();
  } catch (error) {
    console.error(`Error in Inserting Activity: ${error.message}`);
    throw error;
  }
}

const getCstDate = (dateString = Date.now()) => {
  return moment(new Date(dateString)).tz("America/Chicago");
};

async function getUnixExpiration(lastUpdateTime) {
  const unixExpiration = lastUpdateTime.add(7, "days");
  return unixExpiration;
}

module.exports = {
  insertActivity,
};

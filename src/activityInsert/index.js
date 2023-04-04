const { v4 } = require("uuid");
const moment = require("moment-timezone");
const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();

async function insertActivity(Id, data) {
  try {
    let sKey = `STAGES#${v4()}`;
    let pKey = `MRCHT#${Id}`;
    let lastUpdateTime = getCstDate();
    let expiration = await getUnixExpiration(lastUpdateTime);
    let params = {
      TableName: process.env.ACTIVITY_TABLE,
      Item: {
        ...data,
        pKey,
        sKey,
        lastUpdateTime,
        expiration,
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
  // return moment(new Date(dateString)).tz("America/Chicago").format().split('-').slice(0, -1).join('-')
  return moment(new Date(dateString)).tz("America/Chicago");
};

async function getUnixExpiration(lastUpdateTime) {
  // let fetchData = await getItemFromDynamo(process.env.CONFIG_TABLE, `LOOKUP#ADMIN`, `GLOBAL`);
  // let skippedDays = get(fetchData, 'skippedActivityDeleteDays', 7);
  // let anyOtherDays = get(fetchData, 'otherActivityDeleteDays', 30);
  // const skippedDaysTimestampThreshold = moment(new Date()).subtract(skippedDays, 'days').tz("America/Chicago").format().split('-').slice(0, -1).join('-');
  // const otherDaysTimestampThreshold = moment(new Date()).subtract(anyOtherDays, 'days').tz("America/Chicago").format().split('-').slice(0, -1).join('-');

  // let timestampThreshold;
  // if (status === 'SKIPPED') {
  //     timestampThreshold = skippedDaysTimestampThreshold;
  // } else {
  //     timestampThreshold = otherDaysTimestampThreshold;
  // }

  const unixExpiration = lastUpdateTime.add(7, "days");
  return unixExpiration;
}

module.exports = {
  insertActivity,
};

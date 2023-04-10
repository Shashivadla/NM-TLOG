const AWS = require('aws-sdk');
const get = require("lodash.get");
const set = require("lodash.set");

const { getItem, queryWithPartitionKey } = require('../shared/dynamo');

const SALES_TABLE = process.env.SALES_TABLE;
const SHIPPING_TABLE = process.env.SHIPPING_TABLE;

module.exports.handler = async (event) => {
  console.info("Event: ", JSON.stringify(event));
  try {
    await Promise.all(event.Records.map(async (record) => {
      console.log("record", record);
      if(record.eventName === "INSERT"){
        let newImage = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
        console.log("newImage", newImage);
        if(newImage.shippingOrderId) {
          await processRecord(newImage);
        }
      }
    }));
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw "Error while processing t log data.";
  }
};

async function processRecord(newImage) {
  let merchantData = {
    merchantOrder: newImage
  }
  let shippingOrderId = get(newImage, 'shippingOrderId');
  let keys = {
    pKey: `SHIP#${shippingOrderId}`
  }
  let shippingData = await queryWithPartitionKey(SHIPPING_TABLE, keys);
  console.log("shippingData", shippingData);
  await Promise.all(shippingData.Items.map(async (shipment) => {
    console.log("shipment", shipment);
      if(shipment.references_portalOrderCode) {
        set(merchantData, 'shipmentOrder', shipment);
        await fetchSalesDataAndGenerateTLogData(shipment.references_portalOrderCode, merchantData);
      }
  }));
}

async function fetchSalesDataAndGenerateTLogData(portalOrderCode, merchantData) {
  console.log("merchantData", merchantData);
  let keys = {
    pKey: `SALES#${portalOrderCode}`
  }
  let salesData = await queryWithPartitionKey(SALES_TABLE, keys);
  console.log("salesData", salesData);
  
}
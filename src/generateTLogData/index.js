const AWS = require('aws-sdk');
const get = require("lodash.get");
const set = require("lodash.set");

const { getItem, queryWithPartitionKey } = require('../shared/dynamo');
const {
  generateIGTaxData,
  generateIDiscData,
  generateTCustData,
  generateTHeadData,
  generateTItemData,
  generateTEndData
} = require('./generateData');

const SALES_TABLE = process.env.SALES_TABLE;
const SHIPPING_TABLE = process.env.SHIPPING_TABLE;

module.exports.handler = async (event) => {
  console.info("Event: ", JSON.stringify(event));
  try {
    await Promise.all(event.Records.map(async (record) => {
      console.log("record", record);
      if(record.eventName === "INSERT"){
        const newImage = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
        const keys = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.Keys)
        console.log("newImage", newImage);
        await processRecord(keys, newImage);
      }
    }));
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw "Error while processing t log data.";
  }
};

async function processRecord(keys, newImage) {
  const pKey = (get(keys, 'pKey')).replace("MRCHT#","");
  const sKey = get(keys, 'sKey');
  console.log("sKey", sKey);

  if (sKey === 'MERCHANT') {
    if(newImage.shippingOrderId) {
      let addressRecords = await fetchAddressData(pKey, newImage);
      let shippingDetails = addressRecords.find(el => el.addresses_type === "Shipping");
      await Promise.all([
        generateTHeadData(pKey, newImage, shippingDetails),
        generateTEndData(pKey, newImage),
      ]);
    }
  } else if (sKey.includes("LINES_")) {
    console.log("sKey => Passes lines condition.", );
    if (sKey.includes("_TAXES_")) {
      console.log("sKey => Passes taxes condition.", );
      await generateIGTaxData(pKey, newImage);
    } else if (sKey.includes("_DISC_")) {
      console.log("sKey => Passes disc condition.", );
      await generateIDiscData(pKey, newImage);
    } else {
      await generateTItemData(pKey, newImage);
    }
  }
};

async function fetchAddressData(pKey, data) {
  
  let shippingOrderId = get(data, 'shippingOrderId');
  let keys = {
    pKey: `SHIP#${shippingOrderId}`
  }
  let shippingData = await queryWithPartitionKey(SHIPPING_TABLE, keys);
  console.log("shippingData", shippingData);
  const shippingItems = get(shippingData, "Items", []);

  const addressRecords = shippingItems.filter(el => el.sKey.includes("ADDRESSES_") && (el.addresses_type === "Billing" || el.addresses_type === "Shipping") );
  console.log("addressRecords", addressRecords);
  await Promise.all(addressRecords.map(async (address) => {
    await generateTCustData(pKey, address)
  }));
  return addressRecords;
  // await Promise.all(shippingData.Items.map(async (shipment) => {
  //   console.log("shipment", shipment);
  //     if(shipment.references_portalOrderCode) {
  //       set(merchantData, 'shipmentOrder', shipment);
  //       await fetchSalesDataAndGenerateTLogData(shipment.references_portalOrderCode, merchantData);
  //     }
  // }));
};

async function fetchSalesDataAndGenerateTLogData(portalOrderCode, merchantData) {
  console.log("merchantData", merchantData);
  let keys = {
    pKey: `SALES#${portalOrderCode}`
  }
  let salesData = await queryWithPartitionKey(SALES_TABLE, keys);
  console.log("salesData", salesData);
  
};
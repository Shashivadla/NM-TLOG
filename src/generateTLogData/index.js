const AWS = require('aws-sdk');
const get = require("lodash.get");
const set = require("lodash.set");

const { putItem, getItem, queryWithPartitionKey } = require('../shared/dynamo');
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
const TRANSFER_TABLE = process.env.TRANSFER_TABLE;
const CONFIG_TABLE = process.env.CONFIG_TABLE;



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
      await transferRecord(pKey, newImage)
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

async function transferRecord(pKey,event) {
  let  attributesToGet = "versionNbr, transactionTypeCode, timestamp, eventId, totalRecordCount, applicationId, applicationName, routingTypeName, labelName, labelValueText, distroNbr, distroDocType";

let key = {
  pKey: "LOOKUP#Generator",
  sKey: "transfer"
}
  const configData = getItem(CONFIG_TABLE, key, attributesToGet)


  const params = await mapTransferGeneratorRecord(pKey, event, configData);
  await putItem(TRANSFER_TABLE, params)
}

async function mapTransferGeneratorRecord(pKey, event, configData) {

    let record = {
      pKey: pKey,
      sKey: "ITEM#" + event.itemId,
      versionNbr: get(configData, "versionNbr", null),
      transactionTypeCode: get(configData, "transactionTypeCode", null),
      timestamp: moment().utcOffset('-05:00').format('YYYYMMDDHHmmss'),
      eventId: get(configData, "eventId", null),
      totalRecordCount: get(configdata, "totalRecordCount", 0),
      applicationId: get(configData, "applicationId", "CMOS"),
      applicationName: get(configData, "applicationName", "CMOS"),
      routingTypeName: get(configData, "routingTypeName", null),
      labelName: get(configData, "labelName", null),
      labelValueText: get(configData, "labelvalueText", null),
      distroNbr: get(configData, "distrroNbr", null),
      distroDocType: get(configData, "distroDocType", null),
      physicalFromLoc: get(configData, "physicalFromLoc", null),
      fromLocType: get(configData, "fromLocType", null),
      fromLoc: get(configData, "fromLoc", null),
      physicalToLoc: get(configData, "physicalToLoc", null),
      toLocType: get(configData, "toLocType", null),
      toLoc: get(configData, "toLoc", null),
      tsfType: get(configData, "tsfType", null),
      distroStatus: get(configData, "distroStatue", null),
      contextType: get(configData, "contextType", null),
      item: get(event, "itemId", null),
      distroQty: get(event, "values.quantity", null),
      fromDisposition: get(configData, "fromDisposition", null),
      message_Status: "New",
    };
  return record;
}

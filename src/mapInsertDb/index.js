const { merchantMapping } = require("../mapInsertDb/merchantMapping");
const { shippingMapping } = require("../mapInsertDb/shippingMapping");
const { salesMapping } = require("../mapInsertDb/salesMapping");
const { returnMapping } = require("../mapInsertDb/returnMapping");

module.exports.handler = async (event) => {
  console.info("Event: ", JSON.stringify(event));
  try {
    let data = JSON.parse(event.Records[0].body);
    const keysArray = Object.keys(data);
    const secondKeyName = keysArray[1];
    console.log(secondKeyName);
    if (secondKeyName == "stockPoint") {
      await merchantMapping(data);
    } else if (secondKeyName == "customer") {
      await salesMapping(data);
    } else if (secondKeyName == "code") {
      await shippingMapping(data);
    } else if (secondKeyName == "tenantId") {
      await returnMapping(data);
    } else {
      console.log("no mapping done");
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
};

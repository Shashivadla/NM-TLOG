const get = require("lodash.get");
const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();










module.exports.Test = async (event) => {
  console.info("Event: ", JSON.stringify(event));
  // console.info(event.Records[0].body);
  try {
    let data = JSON.parse(event.Records[0].body)
   console.log("data",data)
    await mapping(data);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
};

async function mapping(data) {
  try {
    let map = {
      pkey: "merchant#" + get(data, "id", null),
      skey: "merchant",
      id: get(data, "id", null),
      stockPoint_code: Number(get(data, "stockPoint.code", null)),
      stockPoint_externalId: get(data, "stockPoint.externalId", null),
      orderId: get(data, "orderId", null),
      tenantId: Number(get(data, "tenantId", null)),
      values_currencyCode: get(data, "values.currencyCode", null),
      values_quantity: Number(get(data, "values.quantity", null)),
      values_shippingAmount: Number(get(data, "values.shippingAmount", null)),
      values_totalAmount: Number(get(data, "values.totalAmount", null)),
      shippingOrderId: get(data, "shippingOrderId", null),
    };
    console.log("main data",map)
    await insertdb(map);
console.log(data.values.taxes.length)
    for (let i = 0; i < data.values.taxes.length; i++) {
      let map_l1 = {
        pkey: "merchant#" + get(data, "id", null),
        skey: `values_taxes_${i + 1}`,
        values_taxes_type: get(data, `values.taxes[${i}].type`, null),
        values_taxes_values: Number(
          get(data, `values.taxes[${i}].values`, null)
        ),
      };
      console.log("first data",map_l1)
      await insertdb(map_l1);
    }

    for (let i = 0; i < data.promocodes.length; i++) {
      let code = get(data, `promocodes[${i}].code`, null);
      let map_l2 = {
        pkey: "merchant#" + get(data, "id", null),
        skey: `promocodes_${code}`,
        promocodes_code: get(data, `promocodes[${i}].code`, null),
        promocodes_type: get(data, `promocodes[${i}].type`, null),
      };
      console.log("sec data",map_l2)
      await insertdb(map_l2);
    }

    for (let i = 0; i < data.promotionOffers.shippingOffers.length; i++) {
      let map_l3 = {
        pkey: "merchant#" + get(data, "id", null),
        skey: `promotionOffers_shippingOffers_${i + 1}`,
        promotionOffers_shippingOffers_discount: Number(
          get(data, `promotionOffers.shippingOffers[${i}].discount`, null)
        ),
      };
      await insertdb(map_l3);
    }

    for (let i = 0; i < data.lines.length; i++) {
      let linesid = get(data, `lines[${i}].id`, null);
      let map_l4 = {
        pkey: "merchant#" + get(data, "id", null),
        skey: `lines_${linesid}`,
        lines_id: get(data, `lines[${i}].id`, null),
        lines_merchantBarcode: get(data, `lines[${i}].merchantBarcode`, null),
        lines_values_currencyCode: get(
          data,
          `lines[${i}].values.currencyCode`,
          null
        ),
        lines_values_quantity: Number(
          get(data, `lines[${i}].values.quantity`, null)
        ),
        lines_values_total: get(data, `lines[${i}].values.total`, null),
        lines_shippingOrderLineId: get(
          data,
          `lines[${i}].shippingOrderLineId`,
          null
        ),
        lines_productNumber: get(data, `lines[${i}].productNumber`, null),
        lines_productDescription: get(
          data,
          `lines[${i}].productDescription`,
          null
        ),
      };
      await insertdb(map_l4);
      let taxeslength = data.lines[i].values.taxes.length;

      for (let j = 0; j < taxeslength; j++) {
        let map_l5 = {
          pkey: "merchant#" + get(data, "id", null),
          skey: `lines_${linesid}_taxes_${j + 1}`,
          lines_values_taxes_type: get(
            data,
            `lines[${i}].values.taxes[${j}].type`,
            null
          ),
          lines_values_taxes_value: get(
            data,
            `lines[${i}].values.taxes[${j}].value`,
            null
          ),
          lines_values_taxes_rate: get(
            data,
            `lines[${i}].values.taxes[${j}].rate`,
            null
          ),
        };
        await insertdb(map_l5);
      }
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

async function insertdb(data) {
  let params;
  try {
    params = {
      TableName: "Merchant1",
      Item: data,
    };
    console.info("insert params", params);
    return await dynamodb.put(params).promise();
  } catch (e) {
    console.error("Put Item Error: ", e, "\nPut params: ", params);
    throw "PutItemError";
  }
}

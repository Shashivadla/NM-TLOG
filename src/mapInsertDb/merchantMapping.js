const get = require("lodash.get");
const { insertActivity } = require("../activityInsert/index");
const { insertdb } = require("../shared/db");

async function merchantMapping(data) {
  try {
    let map = {
      pKey: "MRCHT#" + get(data, "id", null),
      sKey: "MERCHANT",
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
    console.log("map data", map);
    await insertdb(map, process.env.MERCHANT_TABLE);
    let taxes = get(data, `values.taxes`, []);
    for (let i = 0; i < taxes.length; i++) {
      let map_l1 = {
        pKey: "MRCHT#" + get(data, "id", null),
        sKey: `VALUES_TAXES_${i + 1}`,
        values_taxes_type: get(taxes[i], `type`, null),
        values_taxes_values: Number(get(taxes[i], `values`, null)),
      };
      console.log("map_l1 data", map_l1);
      await insertdb(map_l1, process.env.MERCHANT_TABLE);
    }

    let promocodes = get(data, "promocodes", []);
    for (let i = 0; i < promocodes.length; i++) {
      let code = get(data, `promocodes[${i}].code`, null);
      let map_l2 = {
        pKey: "MRCHT#" + get(data, "id", null),
        sKey: `PROMOCODES_${code}`,
        promocodes_code: get(promocodes[i], `code`, null),
        promocodes_type: get(promocodes[i], `type`, null),
      };
      console.log("map_l2 data", map_l2);
      await insertdb(map_l2, process.env.MERCHANT_TABLE);
    }

    let shippingOffers = get(data, "promotionOffers.shippingOffers", []);
    for (let i = 0; i < shippingOffers.length; i++) {
      let map_l3 = {
        pKey: "MRCHT#" + get(data, "id", null),
        sKey: `PROMOTIONOFFERS_SHIPPINGOFFERS_${i + 1}`,
        promotionOffers_shippingOffers_discount: Number(
          get(shippingOffers[i], `discount`, null)
        ),
      };
      console.log("map_l3 data", map_l3);
      await insertdb(map_l3, process.env.MERCHANT_TABLE);
    }

    let lines = get(data, "lines", []);
    for (let i = 0; i < lines.length; i++) {
      let linesid = get(data, `lines[${i}].id`, null);
      let map_l4 = {
        pKey: "MRCHT#" + get(data, "id", null),
        sKey: `LINES_${linesid}`,
        lines_id: get(lines[i], `id`, null),
        lines_merchantBarcode: get(lines[i], `merchantBarcode`, null),
        lines_values_currencyCode: get(lines[i], `values.currencyCode`, null),
        lines_values_quantity: Number(get(lines[i], `values.quantity`, null)),
        lines_values_total: get(lines[i], `values.total`, null),
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
      console.log("map_l4 data", map_l4);
      await insertdb(map_l4, process.env.MERCHANT_TABLE);
      let taxes = get(lines[i], `values.taxes`, []);
      for (let j = 0; j < taxes.length; j++) {
        let map_l5 = {
          pKey: "MRCHT#" + get(data, "id", null),
          sKey: `LINES_${linesid}_TAXES_${j + 1}`,
          lines_values_taxes_type: get(taxes[j], `type`, null),
          lines_values_taxes_value: get(taxes[j], `value`, null),
          lines_values_taxes_rate: get(taxes[j], `rate`, null),
        };
        console.log("map_l5 data", map_l5);
        await insertdb(map_l5, process.env.MERCHANT_TABLE);
      }
    }

    let data_SUCCESS = {
      status: "SUCCESS",
      message: "Merchant data inserted Successfully",
      lastUpdateId: "merchantMapping",
    };
    let pKeyInsert = "MRCHT#" + get(data, "id", null);
    await insertActivity(pKeyInsert, data_SUCCESS);
  } catch (error) {
    let data_ERROR = {
      status: "ERROR",
      message: "Merchant data not inserted",
      lastUpdateId: "merchantMapping",
    };
    let pKeyInsert = "MRCHT#" + get(data, "id", null);
    await insertActivity(pKeyInsert, data_ERROR);
    console.error(`Error: ${error.message}`);
  }
}


module.exports = {
  merchantMapping,
};

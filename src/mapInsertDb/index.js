const get = require("lodash.get");
const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();
const { insertActivity } = require("../activityInsert/index");
const { insertdb } = require("../shared/db");

module.exports.handler = async (event) => {
  console.info("Event: ", JSON.stringify(event));
  try {
    let data = JSON.parse(event.Records[0].body);
    console.log("data", data);
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
//--merchant
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
    console.log("main data", map);
    await insertdb(map, process.env.MERCHANT_TABLE);
    console.log(data.values.taxes.length);


    let taxes = get(data, `values.taxes`, []);
    for (let i = 0; i < taxes.length; i++) {
      let map_l1 = {
        pKey: "MRCHT#" + get(data, "id", null),
        sKey: `VALUES_TAXES_${i + 1}`,
        // skey: `values_taxes_${i + 1}`,
        values_taxes_type: get(taxes[i], `type`, null),
        values_taxes_values: Number(get(taxes[i], `values`, null)),
      };
      console.log("first data", map_l1);
      await insertdb(map_l1, process.env.MERCHANT_TABLE);
    }


    let promocodes = get(data, "promocodes", []);
    for (let i = 0; i < promocodes.length; i++) {
      let code = get(data, `promocodes[${i}].code`, null);
      let map_l2 = {
        pKey: "MRCHT#" + get(data, "id", null),
        sKey: `PROMOCODES_${code}`,
        // skey: `promocodes_${code}`,
        promocodes_code: get(promocodes[i], `code`, null),
        promocodes_type: get(promocodes[i], `type`, null),
      };
      console.log("sec data", map_l2);
      await insertdb(map_l2, process.env.MERCHANT_TABLE);
    }

    let shippingOffers = get(data, "promotionOffers.shippingOffers", []);
    for (let i = 0; i < shippingOffers.length; i++) {
      let map_l3 = {
        pKey: "MRCHT#" + get(data, "id", null),
        sKey: `PROMOTIONOFFERS_SHIPPINGOFFERS_${i + 1}`,
        // skey: `promotionOffers_shippingOffers_${i + 1}`,
        promotionOffers_shippingOffers_discount: Number(
          get(shippingOffers[i], `discount`, null)
        ),
      };
      await insertdb(map_l3, process.env.MERCHANT_TABLE);
    }

    let lines = get(data, "lines", []);
    for (let i = 0; i < lines.length; i++) {
      let linesid = get(data, `lines[${i}].id`, null);
      let map_l4 = {
        pKey: "MRCHT#" + get(data, "id", null),
        sKey: `LINES_${linesid}`,
        // skey: `lines_${linesid}`,
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
      await insertdb(map_l4, process.env.MERCHANT_TABLE);
      let taxeslength = data.lines[i].values.taxes.length;

      let taxes = get(lines[i], `values.taxes`, []);
      for (let j = 0; j < taxes.length; j++) {
        let map_l5 = {
          pKey: "MRCHT#" + get(data, "id", null),
          sKey: `LINES_${linesid}_TAXES_${j + 1}`,
          // skey: `lines_${linesid}_taxes_${j + 1}`,
          lines_values_taxes_type: get(taxes[j], `type`, null),
          lines_values_taxes_value: get(taxes[j], `value`, null),
          lines_values_taxes_rate: get(taxes[j], `rate`, null),
        };
        await insertdb(map_l5, process.env.MERCHANT_TABLE);
      }
    }

    let data = {
      status: "SUCCESS",
      message: "Merchant data inserted Successfully",
      lastUpdateId: "merchantMapping",
    };
    await insertActivity(`MRCHT#${id}`, data);
  } catch (error) {
    let data = {
      status: "ERROR",
      message: "Merchant data not inserted",
      lastUpdateId: "merchantMapping",
    };
    await insertActivity(`MRCHT#${id}`, data);
    console.error(`Error: ${error.message}`);
  }
}

//--shipping

async function shippingMapping(data) {
  try{
  let map = {
    pKey: "SHIP#" + get(data, "id", null),
    sKey: "SHIPPINGORDER",
    id: get(data, "id", null),
    code: get(data, "code", null),
    tenantId: Number(get(data, "tenantId", null)),
    createdDate: get(data, "createdDate", null),
    updatedDate: get(data, "updatedDate", null),
    references_portalOrderCode: get(data, "references.portalOrderCode", null),
    references_externalOrderCode: get(
      data,
      "references.externalOrderCode",
      null
    ),
    customer_type: get(data, "customer.type", null),
    customer_name: get(data, "customer.name", null),
    customer_userId: Number(get(data, "customer.userId", null)),
    customer_email: get(data, "customer.email", null),
    fulfillment_timeWindow: get(data, "fulfillment.timeWindow", null),
    fulfillment_timeWindow_max: get(data, "fulfillment.timeWindow.max", null),
    fulfillment_timeWindow_min: get(data, "fulfillment.timeWindow.min", null),
    fulfillment_timeWindow_type: get(data, "fulfillment.timeWindow.type", null),
    fulfillment_shipping_service_code: Number(
      get(data, "fulfillment.shipping.service.code", null)
    ),
    clickAndCollect_collectPointId: get(
      data,
      "clickAndCollect.collectPointId",
      null
    ),
    clickAndCollect_collectLimitDate: get(
      data,
      "clickAndCollect.collectLimitDate",
      null
    ),
  };
  console.log("map");
  console.log(map);
  await insertdb(map, "shippingOrder");

  let addresses = get(data, "addresses", []);
  for (let i = 0; i < addresses.length; i++) {
    let mapl1 = {
      pKey: "SHIP#" + get(data, "id", null),
      sKey: `ADDRESSES_${i + 1}`,
      addresses_type: get(addresses[i], `type`, null),
      addresses_address1: get(addresses[i], `address1`, null),
      addresses_address2: get(addresses[i], `address2`, null),
      addresses_complement: get(addresses[i], `complement`, null),
      addresses_city_name: get(addresses[i], `city.name`, null),
      addresses_state_name: get(addresses[i], `state.name`, null),
      addresses_country_name: get(addresses[i], `country.name`, null),
      addresses_country_alpha2Code: get(
        addresses[i],
        `country.alpha2Code`,
        null
      ),
      addresses_district: get(addresses[i], `district`, null),
      addresses_phone_number: get(addresses[i], `phone.number`, null),
      addresses_phone_directDistanceDialingCode: get(
        addresses[i],
        `phone.directDistanceDialingCode`,
        null
      ),
      addresses_zipCode: get(addresses[i], `zipCode`, null),
    };
    console.log("mapl1");
    console.log(mapl1);
    await insertdb(mapl1, "shippingOrder");
  }

  let totalValues = get(data, "totalValues", []);
  for (let i = 0; i < totalValues.length; i++) {
    let mapl2 = {
      pKey: "SHIP#" + get(data, "id", null),
      sKey: `TOTALVALUES_${i + 1}`,
      totalValues_type: get(totalValues[i], `type`, null),
      totalValues_value_currencyCode: get(
        totalValues[i],
        `value.currencyCode`,
        null
      ),
      totalValues_value_amount: Number(
        get(totalValues[i], `value.amount`, null)
      ),
      totalValues_taxes_type: get(totalValues[i], `taxes.type`, null),
      totalValues_taxes_value_currencyCode: get(
        totalValues[i],
        `taxes.value.currencyCode`,
        null
      ),
      totalValues_taxes_value_amount: Number(
        get(totalValues[i], `taxes.value.amount`, null)
      ),
      totalValues_discountPromoCodeValue: Number(
        get(totalValues[i], `discountPromoCodeValue`, null)
      ),
    };
    console.log("mapl2");
    console.log(mapl2);
    await insertdb(mapl2, "shippingOrder");
  }

  let lines = get(data, "lines", []);
  for (let i = 0; i < lines.length; i++) {
    let mapl3 = {
      pKey: "SHIP#" + get(data, "id", null),
      sKey: `LINES_${get(data, `lines[${i}].id`, null)}`,
      lines_id: get(lines[i], `id`, null),
      lines_references_lineNumber: Number(
        get(lines[i], `references.lineNumber`, null)
      ),
      lines_orderCode: get(lines[i], `orderCode`, null),
      lines_stockPoint_code: Number(get(lines[i], `stockPoint.code`, null)),
      lines_productSummary_productNumber: Number(
        get(lines[i], `productSummary.productNumber`, null)
      ),
      lines_productSummary_productType: get(
        lines[i],
        `productSummary.productType`,
        null
      ),
      lines_productSummary_harmonizedSystem_code: get(
        lines[i],
        `productSummary.harmonizedSystem.code`,
        null
      ),
      lines_productSummary_harmonizedSystem_country_name: get(
        lines[i],
        `productSummary.harmonizedSystem.country.name`,
        null
      ),
      lines_productSummary_harmonizedSystem_country_alpha2Code: get(
        lines[i],
        `productSummary.harmonizedSystem.country.alpha2Code`,
        null
      ),
      lines_productSummary_shortDescription: get(
        lines[i],
        `productSummary.shortDescription`,
        null
      ),
      lines_productSummary_variant_id: get(
        lines[i],
        `productSummary.variant.id`,
        null
      ),
      lines_productSummary_shippingConstraints_isCitesDocumentRequired: get(
        lines[i],
        `productSummary.shippingConstraints.isCitesDocumentRequired`,
        null
      ),
      lines_productSummary_shippingConstraints_isDangerousProduct: get(
        lines[i],
        `productSummary.shippingConstraints.isDangerousProduct`,
        null
      ),
      lines_priceId: get(lines[i], `priceId`, null),
      lines_cancellation_type: get(lines[i], `cancellation.type`, null),
      lines_gift_from: get(lines[i], `gift.from`, null),
      lines_gift_to: get(lines[i], `gift.to`, null),
      lines_gift_message: get(lines[i], `gift.message`, null),
    };

    let barcodes = get(lines[i], `productSummary.variant.barcodes`, []);
    for (let j = 0; j < barcodes.length; j++) {
      let mapl4 = {
        pKey: "SHIP#" + get(data, "id", null),
        sKey: `LINES_${get(
          data,
          `lines[${i}].id`,
          null
        )}_PRODUCTSUMMARY_VARIANT_BARCODES_${j + 1}`,
        lines_productSummary_variant_barcodes_type: get(
          barcodes[j],
          `type`,
          null
        ),
        lines_productSummary_variant_barcodes_barcode: get(
          barcodes[j],
          `barcode`,
          null
        ),
      };
      console.log("mapl4");
      console.log(mapl4);
      await insertdb(mapl4, "shippingOrder");
    }

    
    let totalValues = get(lines[i], `totalValues`, []);
    for (let j = 0; j < totalValues.length; j++) {
      let mapl5 = {
        pKey: "SHIP#" + get(data, "id", null),
        sKey: `LINES_${get(data, `lines[${i}].id`, null)}_TOTALVALUES_${j + 1}`,
        lines_totalValues_type: get(totalValues[j], `type`, null),
        lines_totalValues_value_currencyCode: get(
          totalValues[j],
          `value.currencyCode`,
          null
        ),
        lines_totalValues_value_amount: Number(
          get(totalValues[j], `value.amount`, null)
        ),
        lines_totalValues_discountPromoCodeValue: Number(
          get(totalValues[j], `discountPromoCodeValue`, null)
        ),
      };

      let taxes = get(totalValues[j], `taxes`, []);
      for (let k = 0; k < taxes.length; k++) {
        let mapl6 = {
          pKey: "SHIP#" + get(data, "id", null),
          sKey: `LINES_${get(data, `lines[${i}].id`, null)}_TOTALVAlUES_${
            j + 1
          }_TAXES_${k + 1}`,
          lines_totalValues_taxes_type: get(taxes[k], `type`, null),
          lines_totalValues_taxes_value_currencyCode: get(
            taxes[k],
            `value.currencyCode`,
            null
          ),
          lines_totalValues_taxes_value_amount: Number(
            get(taxes[k], `value.amount`, null)
          ),
        };
        console.log("mapl6");
        console.log(mapl6);
        await insertdb(mapl6, "shippingOrder");
      }
      console.log("mapl5");
      console.log(mapl5);
      await insertdb(mapl5, "shippingOrder");
    }
    console.log("mapl3");
    console.log(mapl3);
    await insertdb(mapl3, "shippingOrder");
  }

  let packages = get(data, "packages", []);
  for (let i = 0; i < packages.length; i++) {
    let mapl7 = {
      pKey: "SHIP#" + get(data, "id", null),
      sKey: `PACKAGES_${get(data, `packages[${i}].id`, null)}`,
      packages_id: get(packages[i], `id`, null),
      packages_status: get(packages[i], `status`, null),
    };

    let boxes = get(packages[i], `boxes`, []);
    for (let j = 0; j < boxes.length; j++) {
      let mapl8 = {
        pKey: "SHIP#" + get(data, "id", null),
        sKey: `PACKAGES_${get(data, `packages[${i}].id`, null)}_BOXES_${j + 1}`,
        packages_boxes_boxCode: Number(get(boxes[j], `boxCode`, null)),
      };

      let lines = get(boxes[j], `lines`);
      for (let k = 0; k < lines.length; k++) {
        let mapl9 = {
          pKey: "SHIP#" + get(data, "id", null),
          sKey: `PACKAGES_${get(data, `packages[${i}].id`, null)}_BOXES_${
            j + 1
          }_lines_${get(
            data,
            `packages[${i}].boxes[${j}].lines[${k}].id`,
            null
          )}`,
          packages_boxes_lines_id: get(lines[k], `id`, null),
        };
        console.log("mapl9");
        console.log(mapl8);
        await insertdb(mapl9, "shippingOrder");
      }
      console.log("mapl8");
      console.log(mapl8);
      await insertdb(mapl8, "shippingOrder");
    }
    console.log("mapl7");
    console.log(mapl7);
    await insertdb(mapl7, "shippingOrder");
  }

  let availableActions = get(data, "availableActions", []);
  for (let i = 0; i < availableActions.length; i++) {
    let mapl10 = {
      pKey: "SHIP#" + get(data, "id", null),
      sKey: `AVAILABLEACTIONS_${i + 1}`,
      availableActions_action: get(availableActions[i], `action`, null),
    };
    console.log("mapl10");
    console.log(mapl10);
    await insertdb(mapl10, "shippingOrder");
  }

  let executedActions = get(data, "executedActions", []);
  for (let i = 0; i < executedActions.length; i++) {
    let mapl11 = {
      pKey: "SHIP#" + get(data, "id", null),
      sKey: `EXECUTEDACTIONS_${i + 1}`,
      executedActions_action: get(executedActions[i], `action`, null),
      executedActions_executedDate: get(
        executedActions[i],
        `executedDate`,
        null
      ),
    };
    console.log("mapl11");
    console.log(mapl11);
    await insertdb(mapl11, "shippingOrder");
  }
  let data = {
    status: "SUCESS",
    message: "SHIP data inserted successfully",
    lastUpdateId: "shippingMapping",
  };
  await insertActivity(`SHIP#${id}`, data);
} catch (error) {
  let data = {
    status: "ERROR",
    message: "SHIP data not inserted",
    lastUpdateId: "shippingMapping",
  };
  await insertActivity(`SHIP#${id}`, data);
  console.error(`Error: ${error.message}`);
}
}

//--sales



async function salesMapping(data) {
  try {
    let mappedsalesData1 = {
      pKey: "SALES#" + get(data, "id", null),
      sKey: "SALES",
      id: get(data, "id", null),
      customer_id: Number(get(data, "customer.id", null)),
      customer_email: get(data, "customer.email", null),
      payment_billingAddress_lastName: get(
        data,
        "payment.billingAddress.lastName",
        null
      ),
      payment_billingAddress_firstName: get(
        data,
        "payment.billingAddress.firstName",
        null
      ),
      payment_billingAddress_addressLine1: get(
        data,
        "payment.billingAddress.addressLine1",
        null
      ),
      payment_billingAddress_addressLine2: get(
        data,
        "payment.billingAddress.addressLine2",
        null
      ),
      payment_billingAddress_addressLine3: get(
        data,
        "payment.billingAddress.addressLine3",
        null
      ),
      payment_billingAddress_vatNumber: get(
        data,
        "payment.billingAddress.vatNumber",
        null
      ),
      payment_billingAddress_city_name: get(
        data,
        "payment.billingAddress.city.name",
        null
      ),
      payment_billingAddress_state_code: get(
        data,
        "payment.billingAddress.state.code",
        null
      ),
      payment_billingAddress_country_name: get(
        data,
        "payment.billingAddress.country.name",
        null
      ),
      payment_billingAddress_country_nativeName: get(
        data,
        "payment.billingAddress.country.nativeName",
        null
      ),
      payment_billingAddress_country_alpha2Code: get(
        data,
        "payment.billingAddress.country.alpha2Code",
        null
      ),
      payment_billingAddress_country_alpha3Code: get(
        data,
        "payment.billingAddress.country.alpha3Code",
        null
      ),
      payment_billingAddress_country_culture: get(
        data,
        "payment.billingAddress.country.culture",
        null
      ),
      payment_billingAddress_country_region: get(
        data,
        "payment.billingAddress.country.region",
        null
      ),
      payment_billingAddress_zipCode: get(
        data,
        "payment.billingAddress.zipCode",
        null
      ),
      payment_billingAddress_phoneContact_value: get(
        data,
        "payment.billingAddress.phoneContact.value",
        null
      ),
      payment_billingAddress_phoneContact_countryCode: get(
        data,
        "payment.billingAddress.phoneContact.countryCode",
        null
      ),
      payment_billingAddress_phoneContact_countryCallingCode: get(
        data,
        "payment.billingAddress.phoneContact.countryCallingCode",
        null
      ),
      promocode: get(data, "promocode", null),
      currency: get(data, "currency", null),
      shippingAddress_firstName: get(data, "shippingAddress.firstName", null),
      shippingAddress_lastName: get(data, "shippingAddress.lastName", null),
      shippingAddress_addressLine2: get(
        data,
        "shippingAddress.addressLine2",
        null
      ),
      shippingAddress_addressLine3: get(
        data,
        "shippingAddress.addressLine3",
        null
      ),
      shippingAddress_addressLine1: get(
        data,
        "shippingAddress.addressLine1",
        null
      ),
      shippingAddress_vatNumber: get(data, "shippingAddress.vatNumber", null),
      shippingAddress_city_name: get(data, "shippingAddress.city.name", null),
      shippingAddress_city_stateId: Number(get(
        data,
        "shippingAddress.city.stateId",
        null
      )),
      shippingAddress_state_code: get(data, "shippingAddress.state.code", null),
      shippingAddress_state_name: get(data, "shippingAddress.state.name", null),
      shippingAddress_country_name: get(
        data,
        "shippingAddress.country.name",
        null
      ),
      shippingAddress_country_nativeName: get(
        data,
        "shippingAddress.country.nativeName",
        null
      ),
      shippingAddress_country_alpha2Code: get(
        data,
        "shippingAddress.country.alpha2Code",
        null
      ),
      shippingAddress_country_alpha3Code: get(
        data,
        "shippingAddress.country.alpha3Code",
        null
      ),
      shippingAddress_country_culture: get(
        data,
        "shippingAddress.country.culture",
        null
      ),
      shippingAddress_country_region: get(
        data,
        "shippingAddress.country.region",
        null
      ),
      shippingAddress_zipCode: get(data, "shippingAddress.zipCode", null),
      shippingAddress_phoneContact_phoneContact: get(
        data,
        "shippingAddress.phoneContact.phoneContact",
        null
      ),
      shippingAddress_phoneContact_countryCode: get(
        data,
        "shippingAddress.phoneContact.countryCode",
        null
      ),
      shippingAddress_phoneContact_countryCallingCode: get(
        data,
        "shippingAddress.phoneContact.countryCallingCode",
        null
      ),
      createdDate: get(data, "createdDate", null),
      updatedDate: get(data, "updatedDate", null),
      totalQuantity: Number(get(data, "totalQuantity", null)),
      subTotalAmount: get(data, "subTotalAmount", null),
      totalDiscount: get(data, "totalDiscount", null),
      totalShippingFee: get(data, "totalShippingFee", null),
      totalTaxes: get(data, "totalTaxes", null),
      grandTotal: get(data, "grandTotal", null),
      subTotalAmountExclTaxes: get(data, "subTotalAmountExclTaxes", null),
      totalDomesticTaxes: get(data, "totalDomesticTaxes", null),
      tags: get(data, "tags", null),
    };
    await insertdb(mappedsalesData1, "salesOrder");

    let intents = get(data, "payment.intents", []);
    for (i = 0; i < intents.length; i++) {
      let mappedsalesData2 = {
        pKey: "SALES#" + get(data, "id", null),
        sKey: "PAYMENT_INTENTS_" + get(data, `payment.intents.[${i}].id`, null),
        payment_intents_id: get(data, `pid`, null),
        // "payment_intents_clientSecret": get(data, `payment.intents[${i}].clientSecret`, null),
        payment_intents_reference: get(intents[i], `reference`, null),
        payment_intents_currency: get(intents[i], `currency`, null),
        payment_intents_dateCreated: get(intents[i], `dateCreated`, null),
        payment_intents_status: get(intents[i], `status`, null),
      };
      await insertdb(mappedsalesData2, "salesOrder");

      let intruments = get(intents[i], "intruments", []);
      for (j = 0; j < intruments.length; j++) {
        let mappedsalesData3 = {
          pKey: "SALES#" + get(data, "id", null),
          sKey: `PAYMENT_INTENTS_${i + 1}_INTRUMENTS_${j + 1}`,
          payment_intents_intruments_method: get(intruments[j], `method`, null),
          payment_intents_intruments_option: get(intruments[j], `option`, null),
          payment_intents_intruments_status: get(intruments[j], `status`, null),
        };
        await insertdb(mappedsalesData3, "salesOrder");

        let amounts = get(intruments[j], "amounts", []);
        for (k = 0; k < amounts.length; k++) {
          let mappedsalesData4 = {
            pKey: "SALES#" + get(data, "id", null),
            sKey: `PAYMENT_INTENTS_${i + 1}_INTRUMENTS_${j + 1}_AMOUNTS_${
              k + 1
            }`,
            payment_intents_intruments_amounts_value: get(
              amounts[k],
              `value`,
              null
            ),
            payment_intents_intruments_amounts_settledValue: get(
              amounts[k],
              `settledValue`,
              null
            ),
            payment_intents_intruments_amounts_refundedValue: get(
              amounts[k],
              `refundedValue`,
              null
            ),
          };
          await insertdb(mappedsalesData4, "salesOrder");
        }

        let authorizations = get(intruments[j], "authorizations", []);
        for (k = 0; k < authorizations.length; k++) {
          let mappedsalesData5 = {
            pKey: "SALES#" + get(data, "id", null),
            sKey: `PAYMENT_INTENTS_${i + 1}_INTRUMENTS_${
              j + 1
            }_AUTHORIZATIONS_${k + 1}`,
            payment_intents_intruments_authorizations_dateCreated: get(
              authorizations[k],
              `dateCreated`,
              null
            ),
            payment_intents_intruments_authorizations_processorTid: get(
              authorizations[k],
              `processorTid`,
              null
            ),
            payment_intents_intruments_authorizations_tld: get(
              authorizations[k],
              `tld`,
              null
            ),
            payment_intents_intruments_authorizations_status: get(
              authorizations[k],
              `status`,
              null
            ),
            payment_intents_intruments_authorizations_processor_name: get(
              authorizations[k],
              `processor.name`,
              null
            ),
            payment_intents_intruments_authorizations_processor_accountName:
              get(authorizations[k], `processor.accountName`, null),
            payment_intents_intruments_authorizations_processor_merchantAccount:
              get(authorizations[k], `processor.merchantAccount`, null),
          };
          await insertdb(mappedsalesData5, "salesOrder");
        }
      }

      let amounts = get(intents[i], "amounts", []);
      for (j = 0; j < amounts.length; j++) {
        let mappedsalesData6 = {
          pKey: "SALES#" + get(data, "id", null),
          sKey: `PAYMENT_INTENTS_${i + 1}_AMOUNTS_${j + 1}`,
          payment_intents_amounts_total: get(amounts[j], `total`, null),
          payment_intents_amounts_items: get(amounts[j], `items`, null),
          payment_intents_amounts_shipping: get(amounts[j], `shipping`, null),
          payment_intents_amounts_paid: get(amounts[j], `paid`, null),
          payment_intents_amounts_remaining: get(amounts[j], `remaining`, null),
        };
        await insertdb(mappedsalesData6, "salesOrder");
      }
    }

    let items = get(data, "items", []);
    for (i = 0; i < items.length; i++) {
      let mappedsalesData7 = {
        pKey: "SALES#" + get(data, "id", null),
        sKey: `ITEMS_` + get(data, `items[${i}].id`, null),
        items_id: Number(get(items[i], `id`, null)),
        items_merchantId: Number(get(items[i], `merchantId`, null)),
        items_marchantOrderId: Number(get(items[i], `marchantOrderId`, null)),
        items_shippingOrderId: get(items[i], `shippingOrderId`, null),
        items_price_priceExclTaxes: get(items[i], `price.priceExclTaxes`, null),
        items_price_priceInclTaxes: get(items[i], `price.priceInclTaxes`, null),
        items_price_discountExclTaxes: get(
          items[i],
          `price.discountExclTaxes`,
          null
        ),
        items_price_discountInclTaxes: get(
          items[i],
          `price.discountInclTaxes`,
          null
        ),
        items_price_discountRate: get(items[i], `price.discountRate`, null),
        items_price_taxesRate: get(items[i], `price.taxesRate`, null),
        items_price_taxesValue: get(items[i], `price.taxesValue`, null),
        items_price_tags: get(items[i], `price.tags`, null),
        items_price_priceWithoutPromotion: get(
          items[i],
          `price.priceWithoutPromotion`,
          null
        ),
        items_productSummary_productId: Number(get(
          items[i],
          `productSummary.productId`,
          null
        )),
        items_productSummary_description: get(
          items[i],
          `productSummary.description`,
          null
        ),
        items_customAttributes: get(items[i], `customAttributes`, null),
        items_productSummary_shortDescription: get(
          items[i],
          `productSummary.shortDescription`,
          null
        ),
        items_merchantOrderCode: get(items[i], `merchantOrderCode`, null),
        items_idProductOffer: get(items[i], `idProductOffer`, null),
        items_tags: get(items[i], `tags`, null),
        items_selectedSaleIntent: get(items[i], `selectedSaleIntent`, null),
        items_uuid: get(items[i], `uuid`, null),
      };
      await insertdb(mappedsalesData7, "salesOrder");

      let promotionOffer = get(items[i], "promotionOffer", []);
      for (j = 0; j < promotionOffer.length; j++) {
        let valueOffers = get(promotionOffer[j], "valueOffers", []);
        for (k = 0; k < valueOffers.length; k++) {
          let mappedsalesData8 = {
            pKey: "SALES#" + get(data, "id", null),
            sKey: `ITEMS_${i + 1}_PROMOTIONOFFERS_${j + 1}_VALUEOFFERS`,
            items_promotionOffer_valueOffers_discount: get(
              valueOffers[k],
              `discount`,
              null
            ),
          };
          await insertdb(mappedsalesData8, "salesOrder");
        }
      }
    }

    let promotionOffers = get(data, "promotionOffers", []);
    for (i = 0; i < promotionOffers.length; i++) {
      let mappedsalesData9 = {
        pKey: "SALES#" + get(data, "id", null),
        sKey: `PROMOTIONOFFERS_${i + 1}`,
        promotionOffers_merchantOrderCode: get(
          promotionOffers[i],
          `merchantOrderCode`,
          null
        ),
      };
      await insertdb(mappedsalesData9, "salesOrder");

      let shippingOffers = get(promotionOffers[i], "shippingOffers", []);
      for (j = 0; j < shippingOffers.length; j++) {
        let mappedsalesData10 = {
          pKey: "SALES#" + get(data, "id", null),
          sKey: `PROMOTIONOFFERS_${i + 1}_SHIPPINGOFFERS__${j + 1}`,
          promotionOffers_shippingOffers_discount: get(
            shippingOffers[j],
            `discount`,
            null
          ),
        };
        await insertdb(mappedsalesData10, "salesOrder");
      }
    }





// async function insertdb(data, tableName) {
//   let params;
//   try {
//     params = {
//       TableName: tableName,
//       Item: data,
    let data = {
      status: "SUCESS",
      message: "Sales data inserted successfully",
      lastUpdateId: "salesMapping",
    };
    await insertActivity(`SALES#${id}`, data);
  } catch (error) {
    let data = {
      status: "ERROR",
      message: "sales data not inserted",
      lastUpdateId: "salesMapping",
    };
    await insertActivity(`SALES#${id}`, data);
    console.error(`Error: ${error.message}`);
  }
}

// -- return
async function returnMapping(data) {
  try {
    let map = {
      pKey: `RETURN#${get(data, "id", null)}`,
      sKey: `RETURN`,
      id: Number(get(data, "id", null)),
      tenantId: Number(get(data, "tenantId", null)),
      customerId: Number(get(data, "customerId", null)),
      customerEmail: get(data, "customerEmail", null),
      returnMethodType: get(data, "returnMethodType", null),
      returnStatus: get(data, "returnStatus", null),
      numberOfBoxes: Number(get(data, "numberOfBoxes", null)),
      transportInformation_transportId: get(
        data,
        "transportInformation.transportId",
        null
      ),
      transportInformation_trackingCode: get(
        data,
        "transportInformation.trackingCode",
        null
      ),
      transportInformation_pickupDate: get(
        data,
        "transportInformation.pickupDate",
        null
      ),
      transportInformation_courierId: Number(
        get(data, "transportInformation.courierId", null)
      ),
      originAddress_address1: get(data, "originAddress.address1", null),
      originAddress_address2: get(data, "originAddress.address2", null),
      originAddress_streetNumber: get(data, "originAddress.streetNumber", null),
      originAddress_city: get(data, "originAddress.city", null),
      originAddress_zipCode: get(data, "originAddress.zipCode", null),
      originAddress_state_id: Number(get(data, "originAddress.state.id", null)),
      originAddress_state_code: get(data, "originAddress.state.code", null),
      originAddress_state_name: get(data, "originAddress.state.name", null),
      originAddress_country_id: Number(get(data, "originAddress.country.id", null)),
      originAddress_country_code: get(data, "originAddress.country.code", null),
      originAddress_country_name: get(data, "originAddress.country.name", null),
      originAddress_name: get(data, "originAddress.name", null),
      originAddress_phone: get(data, "originAddress.phone", null),
      originAddressTransliterated: get(data, "originAddressTransliterated", {}),
      destinationAddress_id: Number(get(data, "destinationAddress.id", null)),
      destinationAddress_name: get(data, "destinationAddress.name", null),
      destinationAddress_contactId: Number(get(
        data,
        "destinationAddress.contactId",
        null
      )),
      destinationAddress_street: get(data, "destinationAddress.street", null),
      destinationAddress_streetNumber: get(
        data,
        "destinationAddress.streetNumber",
        null
      ),
      destinationAddress_state_id: Number(get(
        data,
        "destinationAddress.state.id",
        null
      )),
      destinationAddress_state_code: get(
        data,
        "destinationAddress.state.code",
        null
      ),
      destinationAddress_state_name: get(
        data,
        "destinationAddress.state.name",
        null
      ),
      destinationAddress_city_id: Number(get(data, "destinationAddress.city.id", null)),
      destinationAddress_city_name: get(
        data,
        "destinationAddress.city.name",
        null
      ),
      destinationAddress_country_id: Number(get(
        data,
        "destinationAddress.country.id",
        null
      )),
      destinationAddress_country_code: get(
        data,
        "destinationAddress.country.code",
        null
      ),
      destinationAddress_country_name: get(
        data,
        "destinationAddress.country.name",
        null
      ),
      destinationAddress_continent_id: Number(get(
        data,
        "destinationAddress.continent.id",
        null
      )),
      destinationAddress_continent_code: get(
        data,
        "destinationAddress.continent.code",
        null
      ),
      destinationAddress_continent_name: get(
        data,
        "destinationAddress.continent.name",
        null
      ),
      destinationAddress_zipCode: get(data, "destinationAddress_zipCode", null),
      geoLocation_latitude: get(data, "geoLocation.latitude", null),
      geoLocation_longitude: get(data, "geoLocation.longitude", null),
      pickupSchedule_start: get(data, "pickupSchedule.start", null),
      pickupSchedule_end: get(data, "pickupSchedule.end", null),
      maxPickupDate: get(data, "maxPickupDate", null),
      isIndirectReturn: get(data, "isIndirectReturn", null),
      inStoreLocationId: Number(get(data, "inStoreLocationId", null)),
      inStoreAddressId: Number(get(data, "inStoreAddressId", null)),
      createdDate: get(data, "createdDate", null),
      createdByStaffMemberId: get(data, "createdByStaffMemberId", null),
      refundPreference_paymentType: get(
        data,
        "refundPreference.paymentType",
        null
      ),
      returnCancellation_id: get(data, "returnCancellation.id", null),
      returnCancellation_status: get(data, "returnCancellation.status", null),
      returnCancellation_reason: get(data, "returnCancellation.reason", null),
      contested: get(data, "contested", true),
      externalReturnId: get(data, "externalReturnId", null),
    };
    await insertdb(map, "return");


    let items = get(data, "items", []);
    for (let i = 0; i < items.length; i++) {
      let mapl1 = {
        pKey: `RETURN#${get(data, "id", null)}`,
        sKey: `items_${get(data, `items[${i}].id`, null)}`,
        items_id: Number(get(items[i], `id`, null)),
        items_merchantOrderId: get(items[i], `merchantOrderId`, null),
        items_merchantOrderItemId: Number(get(items[i], `merchantOrderItemId`, null)),
        items_shippingOrderId: get(items[i], `shippingOrderId`, null),
        items_lineUniqueIdentifier: get(items[i], `lineUniqueIdentifier`, null),
        items_orderId: get(items[i], `orderId`, null),
        items_itemStatus_description: get(
          items[i],
          `itemStatus.description`,
          null
        ),
        items_itemStatus_code: get(items[i], `itemStatus.code`, null),
        items_returnReason_code: get(items[i], `returnReason.code`, null),
        items_returnReason_description: get(
          items[i],
          `returnReason.description`,
          null
        ),
        items_observations: get(items[i], `observations`, null),
        items_exchangeId: get(items[i], `exchangeId`, null),
      };

      let actions = get(items[i], "actions", []);
      for (let j = 0; j < actions.length; j++) {
        let mapl2 = {
          pKey: `RETURN#${get(data, "id", null)}`,
          sKey: `items_${get(data, `items[${i}].id`, null)}_actions_${j+1}`,
          items_actions_type: get(actions[j], `type`, null),
          items_actions_data: get(actions[j], `date`, null),
          items_actions_origin_type: get(actions[j], `origin.type`, null),
          items_actions_origin_userId: get(actions[j], `origin.userId`, null),
          items_actions_origin_tenantId: Number(get(
            actions[j],
            `origin.tenantId`,
            null
          )),
        };
        await insertdb(mapl2, "return");
      }
      await insertdb(mapl1, "return");
    }

    let overrides = get(data, "overrides", []);
    for (let i = 0; i < overrides.length; i++) {
      let mapl3 = {
        pKey: `RETURN#${get(data, "id", null)}`,
        sKey: `overrides_${get(data, `overrides[${i}].overrideTypeId`, null)}`,
        overrides_overrideTypeId: Number(get(overrides[i], `overrideTypeId`, null)),
        overrides_observations: get(overrides[i], `observations`, null),
      };
      await  insertdb(mapl3, "return");
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}












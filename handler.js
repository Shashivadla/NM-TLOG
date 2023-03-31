const get = require("lodash.get");
const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.InsetDb = async (event) => {
  console.info("Event: ", JSON.stringify(event));
  // console.info(event.Records[0].body);
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
    } else {
      console.log("no mapping done");
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
};

async function merchantMapping(data) {
  try {
    let map = {
      pkey: "MRCHT#" + get(data, "id", null),
      skey: "MERCHANT",
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
    await insertdb(map, "merchantOrder");
    console.log(data.values.taxes.length);
    for (let i = 0; i < data.values.taxes.length; i++) {
      let map_l1 = {
        pkey: "MRCHT#" + get(data, "id", null),
        skey: `VALUES_TAXES${i + 1}`,
        // skey: `values_taxes_${i + 1}`,
        values_taxes_type: get(data, `values.taxes[${i}].type`, null),
        values_taxes_values: Number(
          get(data, `values.taxes[${i}].values`, null)
        ),
      };
      console.log("first data", map_l1);
      await insertdb(map_l1, "merchantOrder");
    }

    for (let i = 0; i < data.promocodes.length; i++) {
      let code = get(data, `promocodes[${i}].code`, null);
      let map_l2 = {
        pkey: "MRCHT#" + get(data, "id", null),
        skey: `PROMOCODES_${code}`,
        // skey: `promocodes_${code}`,
        promocodes_code: get(data, `promocodes[${i}].code`, null),
        promocodes_type: get(data, `promocodes[${i}].type`, null),
      };
      console.log("sec data", map_l2);
      await insertdb(map_l2, "merchantOrder");
    }

    for (let i = 0; i < data.promotionOffers.shippingOffers.length; i++) {
      let map_l3 = {
        pkey: "MRCHT#" + get(data, "id", null),
        skey: `PROMOTIONOFFERS_SHIPPINGOFFERS_${i + 1}`,
        // skey: `promotionOffers_shippingOffers_${i + 1}`,
        promotionOffers_shippingOffers_discount: Number(
          get(data, `promotionOffers.shippingOffers[${i}].discount`, null)
        ),
      };
      await insertdb(map_l3, "merchantOrder");
    }

    for (let i = 0; i < data.lines.length; i++) {
      let linesid = get(data, `lines[${i}].id`, null);
      let map_l4 = {
        pkey: "MRCHT#" + get(data, "id", null),
        skey: `LINES_${linesid}`,
        // skey: `lines_${linesid}`,
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
      await insertdb(map_l4, "merchantOrder");
      let taxeslength = data.lines[i].values.taxes.length;

      for (let j = 0; j < taxeslength; j++) {
        let map_l5 = {
          pkey: "MRCHT#" + get(data, "id", null),
          skey: `LINES_${linesid}_TAXES_${j + 1}`,
          // skey: `lines_${linesid}_taxes_${j + 1}`,
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
        await insertdb(map_l5, "merchantOrder");
      }
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

async function shippingMapping(data) {
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
  for (let i = 0; i < data.addresses.length; i++) {
    let mapl1 = {
      pKey: "SHIP#" + get(data, "id"),
      sKey: `ADDRESSES_${i + 1}`,
      addresses_type: get(data, `addresses[${i}].type`),
      addresses_address1: get(data, `addresses[${i}].address1`),
      addresses_address2: get(data, `addresses[${i}].address2`),
      addresses_complement: get(data, `addresses[${i}].complement`),
      addresses_city_name: get(data, `addresses[${i}].city.name`),
      addresses_state_name: get(data, `addresses[${i}].state.name`),
      addresses_country_name: get(data, `addresses[${i}].country.name`),
      addresses_country_alpha2Code: get(
        data,
        `addresses[${i}].country.alpha2Code`
      ),
      addresses_district: get(data, `addresses[${i}].district`),
      addresses_phone_number: get(data, `addresses[${i}].phone.number`),
      addresses_phone_directDistanceDialingCode: get(
        data,
        `addresses[${i}].phone.directDistanceDialingCode`
      ),
      addresses_zipCode: get(data, `addresses[${i}].zipCode`),
    };
    console.log("mapl1");
    console.log(mapl1);
    await insertdb(mapl1, "shippingOrder");
  }
  for (let i = 0; i < data.totalValues.length; i++) {
    let mapl2 = {
      pKey: "SHIP#" + get(data, "id"),
      sKey: `TOTALVALUES_${i + 1}`,
      totalValues_type: get(data, `totalValues[${i}].type`),
      totalValues_value_currencyCode: get(
        data,
        `totalValues[${i}].value.currencyCode`
      ),
      totalValues_value_amount: Number(
        get(data, `totalValues[${i}].value.amount`)
      ),
      totalValues_taxes_type: get(data, `totalValues[${i}].taxes.type`),
      totalValues_taxes_value_currencyCode: get(
        data,
        `totalValues[${i}].taxes.value.currencyCode`
      ),
      totalValues_taxes_value_amount: Number(
        get(data, `totalValues[${i}].taxes.value.amount`)
      ),
      totalValues_discountPromoCodeValue: Number(
        get(data, `totalValues[${i}].discountPromoCodeValue`)
      ),
    };
    console.log("mapl2");
    console.log(mapl2);
    await insertdb(mapl2, "shippingOrder");
  }
  for (let i = 0; i < data.lines.length; i++) {
    let mapl3 = {
      pKey: "SHIP#" + get(data, "id"),
      sKey: `LINES_${get(data, `lines[${i}].id`)}`,
      lines_id: get(data, `lines[${i}].id`),
      lines_references_lineNumber: Number(
        get(data, `lines[${i}].references.lineNumber`)
      ),
      lines_orderCode: get(data, `lines[${i}].orderCode`),
      lines_stockPoint_code: Number(get(data, `lines[${i}].stockPoint.code`)),
      lines_productSummary_productNumber: Number(
        get(data, `lines[${i}].productSummary.productNumber`)
      ),
      lines_productSummary_productType: get(
        data,
        `lines[${i}].productSummary.productType`
      ),
      lines_productSummary_harmonizedSystem_code: get(
        data,
        `lines[${i}].productSummary.harmonizedSystem.code`
      ),
      lines_productSummary_harmonizedSystem_country_name: get(
        data,
        `lines[${i}].productSummary.harmonizedSystem.country.name`
      ),
      lines_productSummary_harmonizedSystem_country_alpha2Code: get(
        data,
        `lines[${i}].productSummary.harmonizedSystem.country.alpha2Code`
      ),
      lines_productSummary_shortDescription: get(
        data,
        `lines[${i}].productSummary.shortDescription`
      ),
      lines_productSummary_variant_id: get(
        data,
        `lines[${i}].productSummary.variant.id`
      ),
      lines_productSummary_shippingConstraints_isCitesDocumentRequired: get(
        data,
        `lines[${i}].productSummary.shippingConstraints.isCitesDocumentRequired`
      ),
      lines_productSummary_shippingConstraints_isDangerousProduct: get(
        data,
        `lines[${i}].productSummary.shippingConstraints.isDangerousProduct`
      ),
      lines_priceId: get(data, `lines[${i}].priceId`),
      lines_cancellation_type: get(data, `lines[${i}].cancellation.type`),
      lines_gift_from: get(data, `lines[${i}].gift.from`),
      lines_gift_to: get(data, `lines[${i}].gift.to`),
      lines_gift_message: get(data, `lines[${i}].gift.message`),
    };
    for (
      let j = 0;
      j < data.lines[i].productSummary.variant.barcodes.length;
      j++
    ) {
      let mapl4 = {
        pKey: "SHIP#" + get(data, "id"),
        sKey: `LINES_${get(
          data,
          `lines[${i}].id`
        )}_PRODUCTSUMMARY_VARIANT_BARCODES_${j + 1}`,
        lines_productSummary_variant_barcodes_type: get(
          data,
          `lines[${i}].productSummary.variant.barcodes[${j}].type`
        ),
        lines_productSummary_variant_barcodes_barcode: get(
          data,
          `lines[${i}].productSummary.variant.barcodes[${j}].barcode`
        ),
      };
      console.log("mapl4");
      console.log(mapl4);
      await insertdb(mapl4, "shippingOrder");
    }
    for (let j = 0; j < data.lines[i].totalValues.length; j++) {
      let mapl5 = {
        pKey: "SHIP#" + get(data, "id"),
        sKey: `LINES_${get(data, `lines[${i}].id`)}_TOTALVALUES_${j + 1}`,
        lines_totalValues_type: get(data, `lines[${i}].totalValues[${j}].type`),
        lines_totalValues_value_currencyCode: get(
          data,
          `lines[${i}].totalValues[${j}].value.currencyCode`
        ),
        lines_totalValues_value_amount: Number(
          get(data, `lines[${i}].totalValues[${j}].value.amount`)
        ),
        lines_totalValues_discountPromoCodeValue: Number(
          get(data, `lines[${i}].totalValues[${j}].discountPromoCodeValue`)
        ),
      };
      for (let k = 0; k < data.lines[i].totalValues[j].taxes.length; k++) {
        let mapl6 = {
          pKey: "SHIP#" + get(data, "id"),
          sKey: `LINES_${get(data, `lines[${i}].id`)}_TOTALVAlUES_${
            j + 1
          }_TAXES_${k + 1}`,
          lines_totalValues_taxes_type: get(
            data,
            `lines[${i}].totalValues[${j}].taxes[${k}].type`
          ),
          lines_totalValues_taxes_value_currencyCode: get(
            data,
            `lines[${i}].totalValues[${j}].taxes[${k}].value.currencyCode`
          ),
          lines_totalValues_taxes_value_amount: Number(
            get(data, `lines[${i}].totalValues[${j}].taxes[${k}].value.amount`)
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
  for (let i = 0; i < data.packages.length; i++) {
    let mapl7 = {
      pKey: "SHIP#" + get(data, "id"),
      sKey: `PACKAGES_${get(data, `packages[${i}].id`)}`,
      packages_id: get(data, `packages[${i}].id`),
      packages_status: get(data, `packages[${i}].status`),
    };
    for (let j = 0; j < data.packages[i].boxes.length; j++) {
      let mapl8 = {
        pKey: "SHIP#" + get(data, "id"),
        sKey: `PACKAGES_${get(data, `packages[${i}].id`)}_BOXES_${j + 1}`,
        packages_boxes_boxCode: Number(
          get(data, `packages[${i}].boxes[${j}].boxCode`)
        ),
      };
      for (let k = 0; k < data.packages[i].boxes[j].lines.length; k++) {
        let mapl9 = {
          pKey: "SHIP#" + get(data, "id"),
          sKey: `PACKAGES_${get(data, `packages[${i}].id`)}_BOXES_${
            j + 1
          }_lines_${get(data, `packages[${i}].boxes[${j}].lines[${k}].id`)}`,
          packages_boxes_lines_id: get(
            data,
            `packages[${i}].boxes[${j}].lines[${k}].id`
          ),
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
  for (let i = 0; i < data.availableActions.length; i++) {
    let mapl10 = {
      pKey: "SHIP#" + get(data, "id"),
      sKey: `AVAILABLEACTIONS_${i + 1}`,
      availableActions_action: get(data, `availableActions[${i}].action`),
    };
    console.log("mapl10");
    console.log(mapl10);
    await insertdb(mapl10, "shippingOrder");
  }
  for (let i = 0; i < data.executedActions.length; i++) {
    let mapl11 = {
      pKey: "SHIP#" + get(data, "id"),
      sKey: `EXECUTEDACTIONS_${i + 1}`,
      executedActions_action: get(data, `executedActions[${i}].action`),
      executedActions_executedDate: get(
        data,
        `executedActions[${i}].executedDate`
      ),
    };
    console.log("mapl11");
    console.log(mapl11);
    await insertdb(mapl11, "shippingOrder");
  }
}

async function salesMapping(data) {
  try {
    let mappedsalesData1 = {
      pKey: "SALES#" + get(data, "id", null),
      sKey: "SALES",
      id: get(data, "id", null),
      customer_id: get(data, "customer.id", null),
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
      shippingAddress_city_stateId: get(
        data,
        "shippingAddress.city.stateId",
        null
      ),
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
      totalQuantity: get(data, "totalQuantity", null),
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

    for (i = 0; i < data.payment.intents.length; i++) {
      let mappedsalesData2 = {
        pKey: "SALES#" + get(data, "id", null),
        sKey: "PAYMENT_INTENTS_" + get(data, `payment.intents.[${i}].id`, null),
        payment_intents_id: get(data, `payment.intents.[${i}].id`, null),
        // "payment_intents_clientSecret": get(data, `payment.intents[${i}].clientSecret`, null),
        payment_intents_reference: get(
          data,
          `payment.intents[${i}].reference`,
          null
        ),
        payment_intents_currency: get(
          data,
          `payment.intents[${i}].currency`,
          null
        ),
        payment_intents_dateCreated: get(
          data,
          `payment.intents[${i}].dateCreated`,
          null
        ),
        payment_intents_status: get(data, `payment.intents[${i}].status`, null),
      };
      await insertdb(mappedsalesData2, "salesOrder");

      for (j = 0; j < data.payment.intents[i].intruments.length; j++) {
        let mappedsalesData3 = {
          pKey: "SALES#" + get(data, "id", null),
          sKey: `PAYMENT_INTENTS_${i + 1}_INTRUMENTS_${j + 1}`,
          payment_intents_intruments_method: get(
            data,
            `payment.intents[${i}].intruments[${j}].method`,
            null
          ),
          payment_intents_intruments_option: get(
            data,
            `payment.intents[${i}].intruments[${j}].option`,
            null
          ),
          payment_intents_intruments_status: get(
            data,
            `payment.intents[${i}].intruments[${j}].status`,
            null
          ),
        };
        await insertdb(mappedsalesData3, "salesOrder");
        for (
          k = 0;
          k < data.payment.intents[i].intruments[j].amounts.length;
          k++
        ) {
          let mappedsalesData4 = {
            pKey: "SALES#" + get(data, "id", null),
            sKey: `PAYMENT_INTENTS_${i + 1}_INTRUMENTS_${j + 1}_AMOUNTS_${
              k + 1
            }`,
            payment_intents_intruments_amounts_value: get(
              data,
              `payment.intents[${i}].intruments[${j}].amounts[${k}].value`,
              null
            ),
            payment_intents_intruments_amounts_settledValue: get(
              data,
              `payment.intents[${i}].intruments[${j}].amounts[${k}].settledValue`,
              null
            ),
            payment_intents_intruments_amounts_refundedValue: get(
              data,
              `payment.intents[${i}].intruments[${j}].amounts[${k}].refundedValue`,
              null
            ),
          };
          await insertdb(mappedsalesData4, "salesOrder");
        }
        for (
          k = 0;
          k < data.payment.intents[i].intruments[j].authorizations.length;
          k++
        ) {
          let mappedsalesData5 = {
            pKey: "SALES#" + get(data, "id", null),
            sKey: `PAYMENT_INTENTS_${i + 1}_INTRUMENTS_${
              j + 1
            }_AUTHORIZATIONS_${k + 1}`,
            payment_intents_intruments_authorizations_dateCreated: get(
              data,
              `payment.intents[${i}].intruments[${j}].authorizations[${k}].dateCreated`,
              null
            ),
            payment_intents_intruments_authorizations_processorTid: get(
              data,
              `payment.intents[${i}].intruments[${j}].authorizations[${k}].processorTid`,
              null
            ),
            payment_intents_intruments_authorizations_tld: get(
              data,
              `payment.intents[${i}].intruments[${j}].authorizations[${k}].tld`,
              null
            ),
            payment_intents_intruments_authorizations_status: get(
              data,
              `payment.intents[${i}].intruments[${j}].authorizations[${k}].status`,
              null
            ),
            payment_intents_intruments_authorizations_processor_name: get(
              data,
              `payment.intents[${i}].intruments[${j}].authorizations[${k}].processor.name`,
              null
            ),
            payment_intents_intruments_authorizations_processor_accountName:
              get(
                data,
                `payment.intents[${i}].intruments[${j}].authorizations[${k}].processor.accountName`,
                null
              ),
            payment_intents_intruments_authorizations_processor_merchantAccount:
              get(
                data,
                `payment.intents[${i}].intruments[${j}].authorizations[${k}].processor.merchantAccount`,
                null
              ),
          };
          await insertdb(mappedsalesData5, "salesOrder");
        }
      }
      for (j = 0; j < data.payment.intents[i].amounts.length; j++) {
        let mappedsalesData6 = {
          pKey: "SALES#" + get(data, "id", null),
          sKey: `PAYMENT_INTENTS_${i + 1}_AMOUNTS_${j + 1}`,
          payment_intents_amounts_total: get(
            data,
            `payment.intents[${i}].amounts[${j}].total`,
            null
          ),
          payment_intents_amounts_items: get(
            data,
            `payment.intents[${i}].amounts[${j}].items`,
            null
          ),
          payment_intents_amounts_shipping: get(
            data,
            `payment.intents[${i}].amounts[${j}].shipping`,
            null
          ),
          payment_intents_amounts_paid: get(
            data,
            `payment.intents[${i}].amounts[${j}].paid`,
            null
          ),
          payment_intents_amounts_remaining: get(
            data,
            `payment.intents[${i}].amounts[${j}].remaining`,
            null
          ),
        };
        await insertdb(mappedsalesData6, "salesOrder");
      }
    }

    for (i = 0; i < data.items.length; i++) {
      let mappedsalesData7 = {
        pKey: "SALES#" + get(data, "id", null),
        sKey: `ITEMS_` + get(data, `items[${i}].id`, null),
        items_id: get(data, `items[${i}].id`, null),
        items_merchantId: get(data, `items[${i}].merchantId`, null),
        items_marchantOrderId: get(data, `items[${i}].marchantOrderId`, null),
        items_shippingOrderId: get(data, `items[${i}].shippingOrderId`, null),
        items_price_priceExclTaxes: get(
          data,
          `items[${i}].price.priceExclTaxes`,
          null
        ),
        items_price_priceInclTaxes: get(
          data,
          `items[${i}].price.priceInclTaxes`,
          null
        ),
        items_price_discountExclTaxes: get(
          data,
          `items[${i}].price.discountExclTaxes`,
          null
        ),
        items_price_discountInclTaxes: get(
          data,
          `items[${i}].price.discountInclTaxes`,
          null
        ),
        items_price_discountRate: get(
          data,
          `items[${i}].price.discountRate`,
          null
        ),
        items_price_taxesRate: get(data, `items[${i}].price.taxesRate`, null),
        items_price_taxesValue: get(data, `items[${i}].price.taxesValue`, null),
        items_price_tags: get(data, `items[${i}].price.tags`, null),
        items_price_priceWithoutPromotion: get(
          data,
          `items[${i}].price.priceWithoutPromotion`,
          null
        ),
        items_productSummary_productId: get(
          data,
          `items[${i}].productSummary.productId`,
          null
        ),
        items_productSummary_description: get(
          data,
          `items[${i}].productSummary.description`,
          null
        ),
        items_customAttributes: get(data, `items[${i}].customAttributes`, null),
        items_productSummary_shortDescription: get(
          data,
          `items[${i}].productSummary.shortDescription`,
          null
        ),
        items_merchantOrderCode: get(
          data,
          `items[${i}].merchantOrderCode`,
          null
        ),
        items_idProductOffer: get(data, `items[${i}].idProductOffer`, null),
        items_tags: get(data, `items[${i}].tags`, null),
        items_selectedSaleIntent: get(
          data,
          `items[${i}].selectedSaleIntent`,
          null
        ),
        items_uuid: get(data, `items[${i}].uuid`, null),
      };
      await insertdb(mappedsalesData7, "salesOrder");
      for (j = 0; j < data.items[i].promotionOffer.length; j++) {
        for (
          k = 0;
          k < data.items[i].promotionOffer[j].valueOffers.length;
          k++
        ) {
          let mappedsalesData8 = {
            pKey: "SALES#" + get(data, "id", null),
            sKey: `ITEMS_${i + 1}_PROMOTIONOFFERS_${j + 1}_VALUEOFFERS`,
            items_promotionOffer_valueOffers_discount: get(
              data,
              `items[${i}].promotionOffer[${j}].valueOffers[${k}].discount`,
              null
            ),
          };
          await insertdb(mappedsalesData8, "salesOrder");
        }
      }
    }

    for (i = 0; i < data.promotionOffers.length; i++) {
      let mappedsalesData9 = {
        pKey: "SALES#" + get(data, "id", null),
        sKey: `PROMOTIONOFFERS_${i + 1}`,
        promotionOffers_merchantOrderCode: get(
          data,
          `promotionOffers[${i}].merchantOrderCode`,
          null
        ),
      };
      await insertdb(mappedsalesData9, "salesOrder");
      for (j = 0; j < data.promotionOffers[i].shippingOffers.length; j++) {
        let mappedsalesData10 = {
          pKey: "SALES#" + get(data, "id", null),
          sKey: `PROMOTIONOFFERS_${i + 1}_SHIPPINGOFFERS__${j + 1}`,
          promotionOffers_shippingOffers_discount: get(
            data,
            `promotionOffers[${i}].shippingOffers[${j}].discount`,
            null
          ),
        };
        await insertdb(mappedsalesData10, "salesOrder");
      }
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

async function insertdb(data, tableName) {
  let params;
  try {
    params = {
      TableName: tableName,
      Item: data,
    };
    console.info("insert params", params);
    return await dynamodb.put(params).promise();
  } catch (e) {
    console.error("Put Item Error: ", e, "\nPut params: ", params);
    throw "PutItemError";
  }
}

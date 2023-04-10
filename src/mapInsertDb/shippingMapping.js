const get = require("lodash.get");
const AWS = require("aws-sdk");
const { insertActivity } = require("../activityInsert/index");
const { insertdb } = require("../shared/db");

async function shippingMapping(data) {
  try {
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
      fulfillment_timeWindow_type: get(
        data,
        "fulfillment.timeWindow.type",
        null
      ),
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
    await insertdb(map, process.env.SHIPPING_TABLE);

    let addresses = get(data, "addresses", []);
    for (let i = 0; i < addresses.length; i++) {
      let mapl1 = {
        pKey: "SHIP#" + get(data, "id", null),
        sKey: `ADDRESSES_${i + 1}`,
        type: get(addresses[i], `type`, null),
        address1: get(addresses[i], `address1`, null),
        address2: get(addresses[i], `address2`, null),
        complement: get(addresses[i], `complement`, null),
        city_name: get(addresses[i], `city.name`, null),
        state_name: get(addresses[i], `state.name`, null),
        country_name: get(addresses[i], `country.name`, null),
        country_alpha2Code: get(
          addresses[i],
          `country.alpha2Code`,
          null
        ),
        district: get(addresses[i], `district`, null),
        phone_number: get(addresses[i], `phone.number`, null),
        phone_directDistanceDialingCode: get(
          addresses[i],
          `phone.directDistanceDialingCode`,
          null
        ),
        zipCode: get(addresses[i], `zipCode`, null),
      };
      console.log("mapl1");
      console.log(mapl1);
      await insertdb(mapl1, process.env.SHIPPING_TABLE);
    }

    let totalValues = get(data, "totalValues", []);
    for (let i = 0; i < totalValues.length; i++) {
      let mapl2 = {
        pKey: "SHIP#" + get(data, "id", null),
        sKey: `TOTALVALUES_${i + 1}`,
        type: get(totalValues[i], `type`, null),
        value_currencyCode: get(
          totalValues[i],
          `value.currencyCode`,
          null
        ),
        value_amount: Number(
          get(totalValues[i], `value.amount`, null)
        ),
        taxes_type: get(totalValues[i], `taxes.type`, null),
        taxes_value_currencyCode: get(
          totalValues[i],
          `taxes.value.currencyCode`,
          null
        ),
        taxes_value_amount: Number(
          get(totalValues[i], `taxes.value.amount`, null)
        ),
        discountPromoCodeValue: Number(
          get(totalValues[i], `discountPromoCodeValue`, null)
        ),
      };
      console.log("mapl2");
      console.log(mapl2);
      await insertdb(mapl2, process.env.SHIPPING_TABLE);
    }

    let lines = get(data, "lines", []);
    for (let i = 0; i < lines.length; i++) {
      let mapl3 = {
        pKey: "SHIP#" + get(data, "id", null),
        sKey: `LINES_${get(data, `lines[${i}].id`, null)}`,
        id: get(lines[i], `id`, null),
        references_lineNumber: Number(
          get(lines[i], `references.lineNumber`, null)
        ),
        orderCode: get(lines[i], `orderCode`, null),
        stockPoint_code: Number(get(lines[i], `stockPoint.code`, null)),
        productSummary_productNumber: Number(
          get(lines[i], `productSummary.productNumber`, null)
        ),
        productSummary_productType: get(
          lines[i],
          `productSummary.productType`,
          null
        ),
        productSummary_harmonizedSystem_code: get(
          lines[i],
          `productSummary.harmonizedSystem.code`,
          null
        ),
        productSummary_harmonizedSystem_country_name: get(
          lines[i],
          `productSummary.harmonizedSystem.country.name`,
          null
        ),
        productSummary_harmonizedSystem_country_alpha2Code: get(
          lines[i],
          `productSummary.harmonizedSystem.country.alpha2Code`,
          null
        ),
        productSummary_shortDescription: get(
          lines[i],
          `productSummary.shortDescription`,
          null
        ),
        productSummary_variant_id: get(
          lines[i],
          `productSummary.variant.id`,
          null
        ),
        productSummary_shippingConstraints_isCitesDocumentRequired: get(
          lines[i],
          `productSummary.shippingConstraints.isCitesDocumentRequired`,
          null
        ),
        productSummary_shippingConstraints_isDangerousProduct: get(
          lines[i],
          `productSummary.shippingConstraints.isDangerousProduct`,
          null
        ),
        priceId: get(lines[i], `priceId`, null),
        cancellation_type: get(lines[i], `cancellation.type`, null),
        gift_from: get(lines[i], `gift.from`, null),
        gift_to: get(lines[i], `gift.to`, null),
        gift_message: get(lines[i], `gift.message`, null),
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
          type: get(
            barcodes[j],
            `type`,
            null
          ),
          barcode: get(
            barcodes[j],
            `barcode`,
            null
          ),
        };
        console.log("mapl4");
        console.log(mapl4);
        await insertdb(mapl4, process.env.SHIPPING_TABLE);
      }

      let totalValues = get(lines[i], `totalValues`, []);
      for (let j = 0; j < totalValues.length; j++) {
        let mapl5 = {
          pKey: "SHIP#" + get(data, "id", null),
          sKey: `LINES_${get(data, `lines[${i}].id`, null)}_TOTALVALUES_${
            j + 1
          }`,
          type: get(totalValues[j], `type`, null),
          value_currencyCode: get(
            totalValues[j],
            `value.currencyCode`,
            null
          ),
          value_amount: Number(
            get(totalValues[j], `value.amount`, null)
          ),
          discountPromoCodeValue: Number(
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
            type: get(taxes[k], `type`, null),
            value_currencyCode: get(
              taxes[k],
              `value.currencyCode`,
              null
            ),
            value_amount: Number(
              get(taxes[k], `value.amount`, null)
            ),
          };
          console.log("mapl6");
          console.log(mapl6);
          await insertdb(mapl6, process.env.SHIPPING_TABLE);
        }
        console.log("mapl5");
        console.log(mapl5);
        await insertdb(mapl5, process.env.SHIPPING_TABLE);
      }
      console.log("mapl3");
      console.log(mapl3);
      await insertdb(mapl3, process.env.SHIPPING_TABLE);
    }

    let packages = get(data, "packages", []);
    for (let i = 0; i < packages.length; i++) {
      let mapl7 = {
        pKey: "SHIP#" + get(data, "id", null),
        sKey: `PACKAGES_${get(data, `packages[${i}].id`, null)}`,
        
        id: get(packages[i], `id`, null),
        
        status: get(packages[i], `status`, null),
      };

      let boxes = get(packages[i], `boxes`, []);
      for (let j = 0; j < boxes.length; j++) {
        let mapl8 = {
          pKey: "SHIP#" + get(data, "id", null),
          sKey: `PACKAGES_${get(data, `packages[${i}].id`, null)}_BOXES_${
            j + 1
          }`,
          boxCode: Number(get(boxes[j], `boxCode`, null)),
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
            id: get(lines[k], `id`, null),
          };
          console.log("mapl9");
          console.log(mapl8);
          await insertdb(mapl9, process.env.SHIPPING_TABLE);
        }
        console.log("mapl8");
        console.log(mapl8);
        await insertdb(mapl8, process.env.SHIPPING_TABLE);
      }
      console.log("mapl7");
      console.log(mapl7);
      await insertdb(mapl7, process.env.SHIPPING_TABLE);
    }

    let availableActions = get(data, "availableActions", []);
    for (let i = 0; i < availableActions.length; i++) {
      let mapl10 = {
        pKey: "SHIP#" + get(data, "id", null),
        sKey: `AVAILABLEACTIONS_${i + 1}`,
        action: get(availableActions[i], `action`, null),
      };
      console.log("mapl10");
      console.log(mapl10);
      await insertdb(mapl10, process.env.SHIPPING_TABLE);
    }

    let executedActions = get(data, "executedActions", []);
    for (let i = 0; i < executedActions.length; i++) {
      let mapl11 = {
        pKey: "SHIP#" + get(data, "id", null),
        sKey: `EXECUTEDACTIONS_${i + 1}`,
        action: get(executedActions[i], `action`, null),
        executedDate: get(
          executedActions[i],
          `executedDate`,
          null
        ),
      };
      console.log("mapl11");
      console.log(mapl11);
      await insertdb(mapl11, process.env.SHIPPING_TABLE);
    }
    let data1 = {
      status: "SUCESS",
      message: "SHIP data inserted successfully",
      lastUpdateId: "shippingMapping",
    };
    let pKeyInsert = "SHIP#" + get(data, "id", null);

    await insertActivity(pKeyInsert, data1);
  } catch (error) {
    let data2 = {
      status: "ERROR",
      message: "SHIP data not inserted",
      lastUpdateId: "shippingMapping",
    };
    let pKeyInsert = "SHIP#" + get(data, "id", null);
    await insertActivity(pKeyInsert, data2);

    console.error(`Error: ${error.message}`);
  }
}

module.exports = {
  shippingMapping,
};

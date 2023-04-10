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
      await insertdb(mapl1, process.env.SHIPPING_TABLE);
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
      await insertdb(mapl2, process.env.SHIPPING_TABLE);
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
        await insertdb(mapl4, process.env.SHIPPING_TABLE);
      }

      let totalValues = get(lines[i], `totalValues`, []);
      for (let j = 0; j < totalValues.length; j++) {
        let mapl5 = {
          pKey: "SHIP#" + get(data, "id", null),
          sKey: `LINES_${get(data, `lines[${i}].id`, null)}_TOTALVALUES_${
            j + 1
          }`,
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
        packages_id: get(packages[i], `id`, null),
        packages_status: get(packages[i], `status`, null),
      };

      let boxes = get(packages[i], `boxes`, []);
      for (let j = 0; j < boxes.length; j++) {
        let mapl8 = {
          pKey: "SHIP#" + get(data, "id", null),
          sKey: `PACKAGES_${get(data, `packages[${i}].id`, null)}_BOXES_${
            j + 1
          }`,
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
        availableActions_action: get(availableActions[i], `action`, null),
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
        executedActions_action: get(executedActions[i], `action`, null),
        executedActions_executedDate: get(
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

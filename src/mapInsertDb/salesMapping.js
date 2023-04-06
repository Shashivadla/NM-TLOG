const get = require("lodash.get");
const AWS = require("aws-sdk");
const { insertActivity } = require("../activityInsert/index");
const { insertdb } = require("../shared/db");

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
      shippingAddress_city_stateId: Number(
        get(data, "shippingAddress.city.stateId", null)
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
    await insertdb(mappedsalesData1, process.env.SALES_TABLE);

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
      await insertdb(mappedsalesData2, process.env.SALES_TABLE);

      let intruments = get(intents[i], "intruments", []);
      for (j = 0; j < intruments.length; j++) {
        let mappedsalesData3 = {
          pKey: "SALES#" + get(data, "id", null),
          sKey: `PAYMENT_INTENTS_${i + 1}_INTRUMENTS_${j + 1}`,
          payment_intents_intruments_method: get(intruments[j], `method`, null),
          payment_intents_intruments_option: get(intruments[j], `option`, null),
          payment_intents_intruments_status: get(intruments[j], `status`, null),
        };
        await insertdb(mappedsalesData3, process.env.SALES_TABLE);

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
          await insertdb(mappedsalesData4, process.env.SALES_TABLE);
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
          await insertdb(mappedsalesData5, process.env.SALES_TABLE);
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
        await insertdb(mappedsalesData6, process.env.SALES_TABLE);
      }
    }

    let items = get(data, "items", []);
    console.log("ccccccccccccccccccccccccccc", items);
    for (i = 0; i < items.length; i++) {
      let mappedsalesData7 = {
        pKey: "SALES#" + get(data, "id", null),
        sKey: `ITEMS_` + get(data, `items[${i}].id`, null),
        items_id: get(items[i], `id`, null),
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
        items_productSummary_productId: Number(
          get(items[i], `productSummary.productId`, null)
        ),
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
      await insertdb(mappedsalesData7, process.env.SALES_TABLE);

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
          await insertdb(mappedsalesData8, process.env.SALES_TABLE);
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
      await insertdb(mappedsalesData9, process.env.SALES_TABLE);

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
        await insertdb(mappedsalesData10, process.env.SALES_TABLE);
      }
    }

    let data1 = {
      status: "SUCESS",
      message: "Sales data inserted successfully",
      lastUpdateId: "salesMapping",
    };
    let pKeyInsert = "SALES#" + get(data, "id", null);

    await insertActivity(pKeyInsert, data1);
  } catch (error) {
    let data2 = {
      status: "ERROR",
      message: "sales data not inserted",
      lastUpdateId: "salesMapping",
    };
    let pKeyInsert = "SALES#" + get(data, "id", null);
    await insertActivity(pKeyInsert, data2);
    console.error(`Error: ${error.message}`);
  }
}

module.exports = {
  salesMapping,
};

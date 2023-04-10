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
        id: get(data, `payment.intents.[${i}].id`, null),
        // "payment_intents_clientSecret": get(data, `payment.intents[${i}].clientSecret`, null),
        reference: get(
          data,
          `payment.intents[${i}].reference`,
          null
        ),
        currency: get(
          data,
          `payment.intents[${i}].currency`,
          null
        ),
        dateCreated: get(
          data,
          `payment.intents[${i}].dateCreated`,
          null
        ),
        status: get(data, `payment.intents[${i}].status`, null),
      };
      await insertdb(mappedsalesData2, "salesOrder");

      for (j = 0; j < data.payment.intents[i].intruments.length; j++) {
        let mappedsalesData3 = {
          pKey: "SALES#" + get(data, "id", null),
          sKey: `PAYMENT_INTENTS_${i + 1}_INTRUMENTS_${j + 1}`,
          method: get(
            data,
            `payment.intents[${i}].intruments[${j}].method`,
            null
          ),
          option: get(
            data,
            `payment.intents[${i}].intruments[${j}].option`,
            null
          ),
          status: get(
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
            value: get(
              data,
              `payment.intents[${i}].intruments[${j}].amounts[${k}].value`,
              null
            ),
            settledValue: get(
              data,
              `payment.intents[${i}].intruments[${j}].amounts[${k}].settledValue`,
              null
            ),
            refundedValue: get(
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
            dateCreated: get(
              data,
              `payment.intents[${i}].intruments[${j}].authorizations[${k}].dateCreated`,
              null
            ),
            processorTid: get(
              data,
              `payment.intents[${i}].intruments[${j}].authorizations[${k}].processorTid`,
              null
            ),
            tld: get(
              data,
              `payment.intents[${i}].intruments[${j}].authorizations[${k}].tld`,
              null
            ),
            status: get(
              data,
              `payment.intents[${i}].intruments[${j}].authorizations[${k}].status`,
              null
            ),
            processor_name: get(
              data,
              `payment.intents[${i}].intruments[${j}].authorizations[${k}].processor.name`,
              null
            ),
            processor_accountName:
              get(
                data,
                `payment.intents[${i}].intruments[${j}].authorizations[${k}].processor.accountName`,
                null
              ),
            processor_merchantAccount:
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
          total: get(
            data,
            `payment.intents[${i}].amounts[${j}].total`,
            null
          ),
          items: get(
            data,
            `payment.intents[${i}].amounts[${j}].items`,
            null
          ),
          shipping: get(
            data,
            `payment.intents[${i}].amounts[${j}].shipping`,
            null
          ),
          paid: get(
            data,
            `payment.intents[${i}].amounts[${j}].paid`,
            null
          ),
          remaining: get(
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
        id: get(data, `items[${i}].id`, null),
        merchantId: get(data, `items[${i}].merchantId`, null),
        marchantOrderId: get(data, `items[${i}].marchantOrderId`, null),
        shippingOrderId: get(data, `items[${i}].shippingOrderId`, null),
        price_priceExclTaxes: get(
          data,
          `items[${i}].price.priceExclTaxes`,
          null
        ),
        price_priceInclTaxes: get(
          data,
          `items[${i}].price.priceInclTaxes`,
          null
        ),
        price_discountExclTaxes: get(
          data,
          `items[${i}].price.discountExclTaxes`,
          null
        ),
        price_discountInclTaxes: get(
          data,
          `items[${i}].price.discountInclTaxes`,
          null
        ),
        price_discountRate: get(
          data,
          `items[${i}].price.discountRate`,
          null
        ),
        price_taxesRate: get(data, `items[${i}].price.taxesRate`, null),
        price_taxesValue: get(data, `items[${i}].price.taxesValue`, null),
        price_tags: get(data, `items[${i}].price.tags`, null),
        price_priceWithoutPromotion: get(
          data,
          `items[${i}].price.priceWithoutPromotion`,
          null
        ),
        productSummary_productId: get(
          data,
          `items[${i}].productSummary.productId`,
          null
        ),
        productSummary_description: get(
          data,
          `items[${i}].productSummary.description`,
          null
        ),
        customAttributes: get(data, `items[${i}].customAttributes`, null),
        productSummary_shortDescription: get(
          data,
          `items[${i}].productSummary.shortDescription`,
          null
        ),
        merchantOrderCode: get(
          data,
          `items[${i}].merchantOrderCode`,
          null
        ),
        idProductOffer: get(data, `items[${i}].idProductOffer`, null),
        tags: get(data, `items[${i}].tags`, null),
        selectedSaleIntent: get(
          data,
          `items[${i}].selectedSaleIntent`,
          null
        ),
        uuid: get(data, `items[${i}].uuid`, null),
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
            discount: get(
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
        merchantOrderCode: get(
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
          discount: get(
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

module.exports = {
  salesMapping,
};

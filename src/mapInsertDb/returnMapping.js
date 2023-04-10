const get = require("lodash.get");
const AWS = require("aws-sdk");
const { insertActivity } = require("../activityInsert/index");
const { insertdb } = require("../shared/db");

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
      originAddress_country_id: Number(
        get(data, "originAddress.country.id", null)
      ),
      originAddress_country_code: get(data, "originAddress.country.code", null),
      originAddress_country_name: get(data, "originAddress.country.name", null),
      originAddress_name: get(data, "originAddress.name", null),
      originAddress_phone: get(data, "originAddress.phone", null),
      originAddressTransliterated: get(data, "originAddressTransliterated", {}),
      destinationAddress_id: Number(get(data, "destinationAddress.id", null)),
      destinationAddress_name: get(data, "destinationAddress.name", null),
      destinationAddress_contactId: Number(
        get(data, "destinationAddress.contactId", null)
      ),
      destinationAddress_street: get(data, "destinationAddress.street", null),
      destinationAddress_streetNumber: get(
        data,
        "destinationAddress.streetNumber",
        null
      ),
      destinationAddress_state_id: Number(
        get(data, "destinationAddress.state.id", null)
      ),
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
      destinationAddress_city_id: Number(
        get(data, "destinationAddress.city.id", null)
      ),
      destinationAddress_city_name: get(
        data,
        "destinationAddress.city.name",
        null
      ),
      destinationAddress_country_id: Number(
        get(data, "destinationAddress.country.id", null)
      ),
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
      destinationAddress_continent_id: Number(
        get(data, "destinationAddress.continent.id", null)
      ),
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
    await insertdb(map, process.env.RETURN_TABLE);

    let items = get(data, "items", []);
    for (let i = 0; i < items.length; i++) {
      let mapl1 = {
        pKey: `RETURN#${get(data, "id", null)}`,
        sKey: `items_${get(data, `items[${i}].id`, null)}`,
        items_id: Number(get(items[i], `id`, null)),
        items_merchantOrderId: get(items[i], `merchantOrderId`, null),
        items_merchantOrderItemId: Number(
          get(items[i], `merchantOrderItemId`, null)
        ),
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
          sKey: `items_${get(data, `items[${i}].id`, null)}_actions_${j + 1}`,
          items_actions_type: get(actions[j], `type`, null),
          items_actions_data: get(actions[j], `date`, null),
          items_actions_origin_type: get(actions[j], `origin.type`, null),
          items_actions_origin_userId: get(actions[j], `origin.userId`, null),
          items_actions_origin_tenantId: Number(
            get(actions[j], `origin.tenantId`, null)
          ),
        };
        await insertdb(mapl2, process.env.RETURN_TABLE);
      }
      await insertdb(mapl1, process.env.RETURN_TABLE);
    }

    let overrides = get(data, "overrides", []);
    for (let i = 0; i < overrides.length; i++) {
      let mapl3 = {
        pKey: `RETURN#${get(data, "id", null)}`,
        sKey: `overrides_${get(data, `overrides[${i}].overrideTypeId`, null)}`,
        overrides_overrideTypeId: Number(
          get(overrides[i], `overrideTypeId`, null)
        ),
        overrides_observations: get(overrides[i], `observations`, null),
      };
      await insertdb(mapl3, process.env.RETURN_TABLE);
    }

    let data1 = {
      status: "SUCCESS",
      message: "Return data inserted Successfully",
      lastUpdateId: "returnMapping",
    };
    let pKeyInsert = "RETURN#" + get(data, "id", null);
    await insertActivity(pKeyInsert, data1);
  } catch (error) {
    let data2 = {
      status: "ERROR",
      message: "Return data not inserted",
      lastUpdateId: "returnMapping",
    };
    let pKeyInsert = "RETURN#" + get(data, "id", null);
    await insertActivity(pKeyInsert, data2);
    console.error(`Error: ${error.message}`);
  }
}

module.exports = {
  returnMapping,
};

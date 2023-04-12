const get = require("lodash.get");
const moment = require('moment');

const { putItem } = require('../shared/dynamo');

const T_Log_Table = process.env.T_Log_Table;

async function generateIGTaxData(pKey, data) {
    console.log("pKey", pKey);
    console.log("data in generateIGTaxData()", data);
    const iGTax = {
        igtaxRecordDescriptorType: "IGTAX", 
        igtaxLineId: "", 
        igtaxTaxAuthority: await appendValue("", 10, "0"), //always zeores
        igtaxTaxCode: "STATE ", //always STATE with a blank at end   'STATE '
        igtaxTaxRate: await appendValue("", 20, "0"), //always zeores
        igtaxTaxCode: "P", //sale=P return=N
        igtaxTaxAmount: await appendValue(get(data, "value", ""), 21, "0"), //tax amount 5 implied decimals 
        igtaxReferenceNumber21: await appendValue("", 30, " "), //always blanks
        igtaxReferenceNumber22: await appendValue("", 30, " "), //geo code
        igtaxReferenceNumber23: await appendValue("NJ", 30, " "), //ship to state
        igtaxReferenceNumber24: await appendValue("", 30, " "), //always blanks
        igtaxDpAmount: await appendValue("0.00", 12, " "), //freight amt
        igtaxTaxAmount: await appendValue(get(data, "rate", "0.00"), 12, " "), //amount of tax - 2 decimals
        igtaxTotalFreightAmount: await appendValue("0.00", 12, " "), //freight amt
        igtaxTotalHandleAmount: await appendValue("0.00", 12, " "), //freight amt
        igtaxTotalRetailAmount: await appendValue(get(data, "value", "0.00"), 12, " "), //merchandise amt before discounts
        // igtaxTotalReturnAmount: await appendValue("0.00", 12, " "), //only populate if return
        igtaxTotalTariffAmount: await appendValue("0.00", 12, " "), //cmos has tarriffs does FF
    };

    const keys = {
        pKey: "LOCATION#8050",
        sKey: `THEAD_${pKey}_TITEM_${get(data, "itemIndex", "0")}_TAX_${get(data, "taxIndex", "0")}`
    };
    const item = {
        ...keys,
        ...iGTax
    };

    await putItem(T_Log_Table, item);
};

async function generateIDiscData(pKey, data) {
    console.log("pKey", pKey);
    console.log("data in generateIDiscData()", data);
    const iDisc = { 
        idiscRecordDescriptorType: "IDISC", 
        idiscLineId: "", 
        idiscRmsPromotionNumber: await appendValue("1005", 6, " "), //emp discount=1005  else=1006 => How to identify emp discount key? 
        idiscDiscountReferenceNumber: await appendValue("", 10, " "), //always blanks
        idiscDiscountType: await appendValue("EMPDSC", 6, " "), //emp discount=EMPDSC  percentage off=CPOFF dollar off=CDOFF policy type=CPOLI
        idiscCouponNumber: await appendValue("", 16, " "), //always blanks
        idisccouponReferenceNumber: await appendValue("", 16, " "), //always blanks
        idiscQuantitySign: "N", //sale=N  return=P
        idiscQuanity: await appendValue("", 12, " "), //qty w 4 decimals => Identify qty?
        idiscUnitDiscountAmount: await appendValue("", 20, " "), //discount amt - if $10 off   then 100000
        idiscReferenceNumber13: await appendValue("", 30, " "), //emp discount only = emp PIN   else blanks => How to identify emp discount key? 
        idiscReferenceNumber14: await appendValue("", 30, " "), //emp discount only = discount amt / qty   else blanks => How to identify emp discount key? 
        idiscReferenceNumber15: await appendValue("", 30, " "), //always blanks
        idiscReferenceNumber16: await appendValue("", 30, " "), //always blanks
        idiscUomQty: await appendValue("", 12, " "), //qty w 4 decimals => Identify qty?
        idiscCatchWeightIndicator: await appendValue("", 1, " "), //always blanks
        idiscPromoComponent: await appendValue("", 10, " "), //always blanks
        idiscIncentiveProgram: await appendValue("", 75, " "), //CMOS incentive codes tied to promo  - will FF have incentives?? => Identify CMOS Incentive field
        idiscSaleeventId: await appendValue("", 40, " "), //another incentive field => Identify Incentive field
    };

    const keys = {
        pKey: "LOCATION#8050",
        sKey: `THEAD_${pKey}_TITEM_${get(data, "itemIndex", "0")}_DISC_${get(data, "discIndex", "0")}`
    };
    const item = {
        ...keys,
        ...iDisc
    };

    await putItem(T_Log_Table, item);
};

async function generateTCustData(pKey, data) {
    console.log("pKey", pKey);
    console.log("data in generateTCustData()", data);
    const tCustomer = { 
        tcustRecordDescriptorType: "TCUST", 
        tcustLineId: "", 
        tcustCustomerID: await appendValue(get(data, "userId", ""), 16, " "), //customer master number  CMD?? Do we need a new one in FF
        tcustCustomerIDType: await appendValue(get(data, "type", ""), 6, " "), //internal to cmos do we need a new one in FF
        tcustCustomerName: await appendValue(get(data, "name", ""), 120, " "), //customer name - filed = name (shipping order)
        tcustAddress1: await appendValue(get(data, "addresses_address1", ""), 240, " "), //customer address
        tcustAddress2: await appendValue(get(data, "addresses_city_name", ""), 240, " "), //customer city
        tcustCity: await appendValue(get(data, "addresses_city_name", ""), 120, " "), //customer city
        tcustState: await appendValue(get(data, "addresses_state_name", ""), 3, " "), //customer state
        tcustZipCode: await appendValue(get(data, "addresses_zipCode", ""), 30, " "), //customer zip code
        tcustCountry: await appendValue(get(data, "addresses_country_alpha2Code", ""), 3, " "), //customer country alpha code
        tcustHomePhone: await appendValue(get(data, "addresses_phone_number", ""), 20, " "), //customer home phone
        tcustWorkPhone: await appendValue(get(data, "addresses_phone_number", ""), 20, " "), //customer work phone
        tcustEmail: await appendValue(get(data, "email", ""), 100, " "), //customer email
        tcustBirthdate: await appendValue("", 8, " "), //always blank
        tcustCstRole: await appendValue(get(data, "addresses_type") === "Billing" ? "00001" : "00002", 5, "0"), //1=sold to  2=ship to
    };

    const keys = {
        pKey: "LOCATION#8050",
        sKey: `THEAD_${pKey}_TCUST_${get(data, "addresses_type") === "Billing" ? "1" : "2"}`
    };
    const item = {
        ...keys,
        ...tCustomer
    };

    await putItem(T_Log_Table, item);
};

async function generateTHeadData(pKey, data, shippingDetails) {
    console.log("pKey", pKey);
    console.log("data in generateTCustData()", data);
    console.log("shippingDetails in generateTCustData()", shippingDetails);
    const tHead = { 
        theadRecordDescriptorType: "THEAD", 
        theadLineId: "", 
        theadregister: "8050 ", //hard code  selling loc  will this be 8083?? => 8050 + 1 blank
        theadTransactionDate: await appendValue(moment().utcOffset('-06:00').format('YYYYMMDDHHmmss'), 14, " "), //current date/time 
        theadTransactionNumber: await appendValue("1", 10, "0"), //hard code  start w 1 for an order then increment based on unique items in order
        tCashier: await appendValue("", 10, " "), //blanks  or commission pin if used in FF   we have personal stylists that get commission
        tSalesPerson: await appendValue("", 10, " "), //blanks  or commission pin if used in FF we have personal stylists that get commission
        theadTransactionType: await appendValue("SALE", 6, " "), //SALE or RETURN
        theadSubtransactiontype: await appendValue("SEND", 6, " "), //sale=SEND  return=RETURN  employee purchase = EMP
        theadOrigTranNo: await appendValue("", 10, "0"), //always zeroes
        theadOrigRegNo: await appendValue("", 5, " "), //always blanks
        theadReasonCode: await appendValue("1", 6, " "), //sale regular shipment = 1, sale drop shipment = 2, return = 9
        theadVendorNumber: await appendValue("", 10, " "), //always blank
        theadVendorInvoiceNumber: await appendValue("", 30, " "), //always blank
        theadPaymentRefNumber: await appendValue("", 16, " "), //always blank
        theadProofOfDeliveryNumber: await appendValue("", 30, " "), //always blank
        theadRefNumber1: await appendValue("", 30, " "), //on DCLOSE THEAD record = 1  else blank
        theadRefNumber2: await appendValue("", 30, " "), //sale=blanks  return="See individual item references"
        theadRefNumber3: await appendValue(`${pKey}-1`, 30, " "), //MerchantOrder.id  +  -1
        theadRefNumber4: await appendValue("", 30, " "), //always blank
        theadValueSign: "P", //sale=P  return=N
        theadValue: await appendValue("", 20, "0"), //leave as 0's   AMS calculates
        theadBannerId: await appendValue("", 4, " "), //always blank
        theadRoundedAmountSign: "P", //always P
        theadRoundedAmount: await appendValue("", 20, "0"), //leave as 0's AMS calculates 
        theadRoundedOffAmountSign: "P", //sale=P  return=N
        theadRoundedOffAmount: await appendValue("", 20, "0"), //leave as 0's AMS calculates
        theadCreditPromotionId: await appendValue("", 10, " "), //always blank
        theadRefNumber25: await appendValue(get(shippingDetails, "name", ""), 30, " "), // ShippingOrder.name
        theadRefNumber26: await appendValue(get(shippingDetails, "addresses_address1", ""), 30, " "), // ShippingOrder.addresses need city state zip
        theadRefNumber27: await appendValue("", 30, " "), //always blank 
        theadTransactionProcessingSystem: "OMS", //can we use FF?? => Is it static value on FHead?
        theadCallCenterId: "3", //HARD CODE 3
        theadExtItemId: await appendValue("", 11, " "), //always blank
        theadOrderDeviceType: await appendValue("", 1, " "), //always blank
        theadOrderId: await appendValue(pKey, 8, " "), //MerchantOrder.id
        theadRegistryId: await appendValue("", 17, " "), //always banks
        theadSaCreateTime: await appendValue(moment().utcOffset('-06:00').format('HH:mm:ss'), 8, " "), //time from shipment
        theadSaTicketNumber: await appendValue(`${pKey}-1`, 12, " "), //MerchantOrder.id  +  -1   for item #1 for this order  will increment thru each line in order
        theadVendorOrderNumber: await appendValue("", 30, " "), //shoprunner would put order # here  - otherwise blanks   
        theadWebConfirmNumber: await appendValue("", 11, " "), //always blank
        theadWebCookie: await appendValue("", 1, " "), //always blank
        theadWebProfileID: await appendValue("", 1, " "), //always blank
        theadOrderType: "T", //T=telephone w=web  m=mailorder   - default to W??
        theadExtItemId2: await appendValue(`CM${pKey}`, 20, " "), //MerchantOrder.id  with CM in front
        theadWebConfirmNumber2: await appendValue(`CM${pKey}`, 20, " "), //MerchantOrder.id  with CM in front
        processingFlag: false // Will set flag to false if it's new or existing entry.
    };

    const keys = {
        pKey: "LOCATION#8050",
        sKey: `THEAD_${pKey}`
    };
    const item = {
        ...keys,
        ...tHead
    };

    await putItem(T_Log_Table, item);
};

async function generateTItemData(pKey, data) {
    console.log("pKey", pKey);
    console.log("data in generateTItemData()", data);
    const tItem = { 
        tcustItemType: await appendValue("ITEM", 6, " "), //if retail dept = ITEM  else NMITEM  (non merch like a leased dept)
        titemRecordDescriptorType: await appendValue("TITEM", 5, " "), //hard code TITEM
        titemLineId: "", //incremented line #
        titemItemStatus: await appendValue("S", 6, " "), //S=sold   R=Return
        iitemItemNumberType: await appendValue("ITEM", 6, " "), //if retail dept = ITEM  else blanks
        titemFormatID: await appendValue("", 1, " "), //always blanks
        ItemSwipedInd: await appendValue(get(data, "id"), 25, " "), //Sku id => PIM/SKU
        ReferenceItem: await appendValue("", 25, " "), // if dept=901 and refund type  put customers 2 digit state => Where to find department info? 
        titemNonMerchandiseItem: await appendValue("", 25, " "), //always blanks
        titemVoucher: await appendValue("", 25, " "), //always blanks
        titemDepartment: "5301", // dept - need to lookup in a table API master data => Where to find department info?
        titemClass: "0317", // class - need to lookup in table => Where to find class info?
        titemSubclass: "0317", // subclass - need to lookup in table => Where to find sub class info?
        titemQuantitySign: "P", //sale=P  return=N
        titemQuantity: await appendValue(get(data, "quantity"), 25, "0"), //retail dept=qty shipped  else =1
        titemSellingUnitOfMeasure: await appendValue("EA", 25, " "), //always EA
        titemUnitRetail: await appendValue(get(data, "total"), 20, "0"), //unit retail - before discounts => Where to get unit retail before discount.
        titemOverrideReason: await appendValue("", 6, " "), //always blanks
        titemOriginalUnitRetail: await appendValue(get(data, "total"), 20, "0"), //only used for rakutan - tells rakutan if item was marked down - cmos sends regular retail 
        titemTaxableIndicator: await appendValue("", 1, " "), //always blank
        titemPump: await appendValue("", 8, " "), //always blank
        titemReferenceNumber5: await appendValue("5301", 30, " "), // dept => Where to find department info?
        titemReferenceNumber6: await appendValue("317", 30, " "), // class => Where to find class info?
        titemReferenceNumber7: pKey, // MerchantOrder.id  + * + 1   (1 will increment based on # of sale trans) => Merchant id
        titemReferenceNumber8: await appendValue(`8050/8050/000000/${moment().utcOffset('-06:00').format('DDMMYYYY')}`, 30, " "), //returns = store # / store # / 000000/date    8083/8083/000000/02062023   for sale blanks
        itemItemSwipedInd: "N", //always N
        titemReturnReasonCode: await appendValue("", 6, " "), //does FF have return reason codes - put them here.
        titemSalesperson: await appendValue("", 10, " "), //does FF do commission or personal stylists??
        titemExpirationDate: await appendValue("", 8, " "), //always blank
        titemDropShipInd: "N", //Y=dropship N=not dropship => How to define dropship?
        titemUomQty: await appendValue(get(data, "quantity"), 12, " "), //qty sold for this line
        Catchweight_ind: "N", //always an N
        Sellingitem: await appendValue("", 25, " "), //always blanks
        Customer_order_line_no: await appendValue("", 6, "0"), //always zeroes   6
        MediaId: await appendValue("", 10, "0"), //always zeroes  10
        TotalIgtaxAmount: await appendValue("2016000", 21, "0"), //tax charge for line item   5 implied decimals
        Unique_ID: await appendValue("", 128, " "), //only used if 2nd commission person else blanks
        CustomerOrderNumber: await appendValue(get(data, "id"), 48, " "), //Merchant id
        CustomerOrderDate: await appendValue(moment().utcOffset('-06:00').format('YYYYMMDDHHmmss'), 14, " "), //date customer order was placed, no such key so kept current time
        FulfillmentOrderNumber: await appendValue("", 48, " "), //always blanks
        NoInventoryReturn: await appendValue("", 1, " "), //always blanks
        SalesType: await appendValue("", 1, " "), //always blanks
        ReturnWarehouse: await appendValue("", 10, " "), //always blanks
        ReturnDisposition: await appendValue("", 10, " "), //always blanks
        orderQty: await appendValue(get(data, "quantity"), 3, " "), //qty for line
        stat2: await appendValue("", 2, " "), //does MAO have statuses (PT=ticket has been printed)
        cat_id: "NMS21", //cmos offer item  - what to be used in FF
        time_num: moment().utcOffset('-06:00').format('HH:mm:ss'), //what is the time of shipment
        ordered_by_store: await appendValue("", 4, "0"), //always zeroes
        fulfillment_sku: await appendValue("", 25, " "), //always blanks
        fulfillment_store_no: "7060", //where order was shipped from  - can be used for transfer trans as well
        order_item_id: "C4TWJ", //2nd half of the depiction - what would FF be using
        orig_order_item_id: await appendValue("", 12, " "), //has something to do with returns - order line being returned??? Need more info
        orig_order_dept: await appendValue("", 3, " "), //returns - current dept => Where to find department info?
        orig_order_class: await appendValue("", 3, " ") //returns - current class => Where to find class info?
    };

    const keys = {
        pKey: "LOCATION#8050",
        sKey: `THEAD_${pKey}_TITEM_${get(data, "itemIndex", "0")}`
    };
    const item = {
        ...keys,
        ...tItem
    };

    await putItem(T_Log_Table, item);
};

async function generateTEndData(pKey, data) {
    console.log("pKey", pKey);
    console.log("data in generateTEndData()", data);
    const tTEnd = { 
        ttendRecordDescriptorType: "TTEND", //TTEND
        ttendtitemLineId: "", //incremented line #
        ttendTenderTypeGroup: await appendValue("CCARD", 6, " "), // randy can send groups
        ttendTenderTypeId: await appendValue("4", 6, "0"), // randy to send typesa
        ttendTenderSign: "P", //sale=P  return=N
        ttendTenderAmount: await appendValue(get(data, "totalAmount", ""), 20, "0"), //total amt charged/returned to this  type   cccard vs gift card 
        ttendCreditcardNumber: await appendValue("", 40, " "), //always blank
        ttendCreditcardAuthNumber: await appendValue("", 16, " "), //aurus auth #
        ttendCreditCardAuthorizationSource: await appendValue("M", 6, " "), //always an M
        ttendCreditcardCardholderVerification: await appendValue("E", 6, " "), //always an E
        ttendCreditcardExpirationDate: await appendValue("", 8, " "), //aurus sends
        ttendCreditcardEntryMode: await appendValue("T", 6, " "), //always a T
        ttendCreditcardTerminalId: await appendValue("", 5, " "), //always blanks
        ttendCreditcardSpecialCondition: await appendValue("P", 6, " "), //web=E  telephone=P  mail=M    so always E???
        ttendVoucherNumber: await appendValue("", 16, " "), //always blanks
        ttendCouponNumber: await appendValue("", 16, " "), //always blanks
        ttendCouponReferenceNumber: await appendValue("", 16, " "), //always blanks
        ttendChequeAccountNumber: await appendValue("", 30, " "), //always blanks
        ttendChequeNumber: await appendValue("", 10, "0"), //always zeroes
        ttendIdentificationMethod: await appendValue("", 6, " "), //always blanks
        ttendIdentificationId: await appendValue("", 40, " "), //always blanks
        ttendOriginalCurrencyAmount: await appendValue("", 3, " "), //always blanks
        ttendOriginalCurrencyAmount: await appendValue("", 20, "0"), //always zeroes
        ttendReferenceNumber9: await appendValue("", 30, " "), // aurus  trans id for CC  gift card = blanks, API call to Aurus
        ttendReferenceNumber10: await appendValue("", 30, " "), // aurus sub card type for CC  gift card =blanks 
        ttendReferenceNumber11: await appendValue("", 30, " "), // aUrus KI number  gift card = blanks
        ttendReferenceNumber12: await appendValue("", 30, " "), // aurus ticket #   gift card=blanks
        ttendPaymentCode: await appendValue("CHG", 4, " "), // AMEX, BG, CASH, CHG, DISC, MC, NMBF, PPC, VISA => gift card is considered cash here
    };

    const keys = {
        pKey: "LOCATION#8050",
        sKey: `THEAD_${pKey}_TEND_${pKey}`
    };
    const item = {
        ...keys,
        ...tTEnd
    };

    await putItem(T_Log_Table, item);
};

async function appendValue(key, value, valueToAppend){
    return key.toString().padStart(value, valueToAppend)
}

module.exports = {
    generateIGTaxData,
    generateIDiscData,
    generateTCustData,
    generateTHeadData,
    generateTItemData,
    generateTEndData
};
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
        igtaxTaxAuthority: "0000000000", //always zeores
        igtaxTaxCode: "STATE ", //always STATE with a blank at end   'STATE '
        igtaxTaxRate: "00000000000000000000", //always zeores
        igtaxTaxCode: "P", //sale=P return=N
        igtaxTaxAmount: "000000000000002016000", //tax amount 5 implied decimals 
        igtaxReferenceNumber21: "", //always blanks
        igtaxReferenceNumber22: "", //geo code
        igtaxReferenceNumber23: "NJ", //ship to state
        igtaxReferenceNumber24: "", //always blanks
        igtaxDpAmount: "0.00", //freight amt
        igtaxTaxAmount: get(data, "rate"), //amount of tax - 2 decimals
        igtaxTotalFreightAmount: "0.00", //freight amt
        igtaxTotalHandleAmount: "0.00", //freight amt
        igtaxTotalRetailAmount: get(data, "value"), //merchandise amt before discounts
        // igtaxTotalReturnAmount: "0.00", //only populate if return
        igtaxTotalTariffAmount: "0.00", //cmos has tarriffs does FF
    };

    const keys = {
        pKey: "8050",
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
        idiscRmsPromotionNumber: "1005", //emp discount=1005  else=1006 => How to identify emp discount key? 
        idiscDiscountReferenceNumber: "", //always blanks
        idiscDiscountType: "EMPDSC", //emp discount=EMPDSC  percentage off=CPOFF dollar off=CDOFF policy type=CPOLI
        idiscCouponNumber: "", //always blanks
        idisccouponReferenceNumber: "", //always blanks
        idiscQuantitySign: "N", //sale=N  return=P
        idiscQuanity: "", //qty w 4 decimals => Identify qty?
        idiscUnitDiscountAmount: "", //discount amt - if $10 off   then 100000
        idiscReferenceNumber13: "", //emp discount only = emp PIN   else blanks => How to identify emp discount key? 
        idiscReferenceNumber14: "", //emp discount only = discount amt / qty   else blanks => How to identify emp discount key? 
        idiscReferenceNumber15: "", //always blanks
        idiscReferenceNumber16: "", //always blanks
        idiscUomQty: "", //qty w 4 decimals => Identify qty?
        idiscCatchWeightIndicator: "", //always blanks
        idiscPromoComponent: "", //always blanks
        idiscIncentiveProgram: "", //CMOS incentive codes tied to promo  - will FF have incentives?? => Identify CMOS Incentive field
        idiscSaleeventId: "", //another incentive field => Identify Incentive field
    };

    const keys = {
        pKey: "8050",
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
        tcustCustomerID: get(data, "userId", ""), //customer master number  CMD?? Do we need a new one in FF
        tcustCustomerIDType: get(data, "type", ""), //internal to cmos do we need a new one in FF
        tcustCustomerName: get(data, "name", ""), //customer name - filed = name (shipping order)
        tcustAddress1: get(data, "addresses_address1", ""), //customer address
        tcustAddress2: get(data, "addresses_city_name", ""), //customer city
        tcustCity: get(data, "addresses_city_name", ""), //customer city
        tcustState: get(data, "addresses_state_name", ""), //customer state
        tcustZipCode: get(data, "addresses_zipCode", ""), //customer zip code
        tcustCountry: get(data, "addresses_country_alpha2Code", ""), //customer country alpha code
        tcustHomePhone: get(data, "addresses_phone_number", ""), //customer home phone
        tcustWorkPhone: get(data, "addresses_phone_number", ""), //customer work phone
        tcustEmail: get(data, "email", ""), //customer email
        tcustBirthdate: "blanks", //always blank
        tcustCstRole: get(data, "addresses_type") === "Billing" ? "0001" : "0002", //1=sold to  2=ship to
    };

    const keys = {
        pKey: "8050",
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
        theadTransactionDate: moment().utcOffset('-06:00').format('YYYYMMDDHHmmss'), //current date/time 
        theadTransactionNumber: "0000000001 ", //hard code  start w 1 for an order then increment based on unique items in order
        tCashier: "blanks", //blanks  or commission pin if used in FF   we have personal stylists that get commission
        tSalesPerson: "blanks", //blanks  or commission pin if used in FF we have personal stylists that get commission
        theadTransactionType: "SALE", //SALE or RETURN
        theadSubtransactiontype: "SEND", //sale=SEND  return=RETURN  employee purchase = EMP
        theadOrigTranNo: "0000000000", //always zeroes
        theadOrigRegNo: "blanks", //always blanks
        theadReasonCode: "1", //sale regular shipment = 1, sale drop shipment = 2, return = 9
        theadVendorNumber: "blanks", //always blank
        theadVendorInvoiceNumber: "blanks", //always blank
        theadPaymentRefNumber: "blanks", //always blank
        theadProofOfDeliveryNumber: "blanks", //always blank
        theadRefNumber1: "blanks", //on DCLOSE THEAD record = 1  else blank
        theadRefNumber2: "blanks", //sale=blanks  return="See individual item references"
        theadRefNumber3: `${pKey}-1`, //MerchantOrder.id  +  -1
        theadRefNumber4: "blanks", //always blank
        theadValueSign: "P", //sale=P  return=N
        theadValue: "00000000000000000000", //leave as 0's   AMS calculates
        theadBannerId: "blanks", //always blank
        theadRoundedAmountSign: "P", //always P
        theadRoundedAmount: "00000000000000000000", //leave as 0's AMS calculates 
        theadRoundedOffAmountSign: "P", //sale=P  return=N
        theadRoundedOffAmount: "00000000000000000000", //leave as 0's AMS calculates
        theadCreditPromotionId: "blanks", //always blank
        theadRefNumber25: get(shippingDetails, "name", ""), // ShippingOrder.name
        theadRefNumber26: get(shippingDetails, "addresses_address1", ""), // ShippingOrder.addresses need city state zip
        theadRefNumber27: "blanks", //always blank 
        theadTransactionProcessingSystem: "OMS", //can we use FF?? => Is it static value on FHead?
        theadCallCenterId: "3", //HARD CODE 3
        theadExtItemId: "blanks", //always blank
        theadOrderDeviceType: "blanks", //always blank
        theadOrderId: pKey, //MerchantOrder.id
        theadRegistryId: "blanks", //always banks
        theadSaCreateTime: moment().utcOffset('-06:00').format('HH:mm:ss'), //time from shipment
        theadSaTicketNumber: pKey, //MerchantOrder.id  +  -1   for item #1 for this order  will increment thru each line in order
        theadVendorOrderNumber: "blanks", //shoprunner would put order # here  - otherwise blanks   
        theadWebConfirmNumber: "blanks", //always blank
        theadWebCookie: "blanks", //always blank
        theadWebProfileID: "blanks", //always blank
        theadOrderType: "T", //T=telephone w=web  m=mailorder   - default to W??
        theadExtItemId2: `CM${pKey}`, //MerchantOrder.id  with CM in front
        theadWebConfirmNumber2: `CM${pKey}`, //MerchantOrder.id  with CM in front
        processingFlag: false // Will set flag to false if it's new or existing entry.
    };

    const keys = {
        pKey: "8050",
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
        tcustItemType: "ITEM", //if retail dept = ITEM  else NMITEM  (non merch like a leased dept)
        titemRecordDescriptorType: "TITEM", //hard code TITEM
        titemLineId: "", //incremented line #
        titemItemStatus: "S", //S=sold   R=Return
        iitemItemNumberType: "ITEM", //if retail dept = ITEM  else blanks
        titemFormatID: "blanks", //always blanks
        ItemSwipedInd: get(data, "id"), //Sku id => PIM/SKU
        ReferenceItem: "blanks", // if dept=901 and refund type  put customers 2 digit state => Where to find department info? 
        titemNonMerchandiseItem: "blanks", //always blanks
        titemVoucher: "blanks", //always blanks
        titemDepartment: "5301", // dept - need to lookup in a table API master data => Where to find department info?
        titemClass: "0317", // class - need to lookup in table => Where to find class info?
        titemSubclass: "0317", // subclass - need to lookup in table => Where to find sub class info?
        titemQuantitySign: "P", //sale=P  return=N
        titemQuantity: get(data, "quantity"), //retail dept=qty shipped  else =1
        titemSellingUnitOfMeasure: "EA", //always EA
        titemUnitRetail: "00000000000000380000", //unit retail - before discounts => Where to get unit retail before discount.
        titemOverrideReason: "blanks", //always blanks
        titemOriginalUnitRetail: "00000000000000380000", //only used for rakutan - tells rakutan if item was marked down - cmos sends regular retail 
        titemTaxableIndicator: "blanks", //always blank
        titemPump: "blanks", //always blank
        titemReferenceNumber5: "5301", // dept => Where to find department info?
        titemReferenceNumber6: "317", // class => Where to find class info?
        titemReferenceNumber7: pKey, // MerchantOrder.id  + * + 1   (1 will increment based on # of sale trans) => Merchant id
        titemReferenceNumber8: `8050/8050/000000/${moment().utcOffset('-06:00').format('DDMMYYYY')}`, //returns = store # / store # / 000000/date    8083/8083/000000/02062023   for sale blanks
        itemItemSwipedInd: "N", //always N
        titemReturnReasonCode: "blanks", //does FF have return reason codes - put them here.
        titemSalesperson: "blanks", //does FF do commission or personal stylists??
        titemExpirationDate: "blanks", //always blank
        titemDropShipInd: "N", //Y=dropship N=not dropship => How to define dropship?
        titemUomQty: get(data, "quantity"), //qty sold for this line
        Catchweight_ind: "N", //always an N
        Sellingitem: "blanks", //always blanks
        Customer_order_line_no: "000000", //always zeroes   6
        MediaId: "0000000000", //always zeroes  10
        TotalIgtaxAmount: "000000000000002016000", //tax charge for line item   5 implied decimals
        Unique_ID: "blanks", //only used if 2nd commission person else blanks
        CustomerOrderNumber: get(data, "id"), //Merchant id
        CustomerOrderDate: moment().utcOffset('-06:00').format('YYYYMMDDHHmmss'), //date customer order was placed, no such key so kept current time
        FulfillmentOrderNumber: "blanks", //always blanks
        NoInventoryReturn: "blanks", //always blanks
        SalesType: "blanks", //always blanks
        ReturnWarehouse: "blanks", //always blanks
        ReturnDisposition: "blanks", //always blanks
        orderQty: get(data, "quantity"), //qty for line
        stat2: "blanks", //does MAO have statuses (PT=ticket has been printed)
        cat_id: "NMS21", //cmos offer item  - what to be used in FF
        time_num: moment().utcOffset('-06:00').format('HH:mm:ss'), //what is the time of shipment
        ordered_by_store: "0000", //always zeroes
        fulfillment_sku: "blanks", //always blanks
        fulfillment_store_no: "7060", //where order was shipped from  - can be used for transfer trans as well
        order_item_id: "C4TWJ", //2nd half of the depiction - what would FF be using
        orig_order_item_id: "blanks", //has something to do with returns - order line being returned??? Need more info
        orig_order_dept: "blanks", //returns - current dept => Where to find department info?
        orig_order_class: "blanks" //returns - current class => Where to find class info?
    };

    const keys = {
        pKey: "8050",
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
        ttendTenderTypeGroup: "CCARD ", // randy can send groups
        ttendTenderTypeId: "000004", // randy to send typesa
        ttendTenderSign: "P", //sale=P  return=N
        ttendTenderAmount: get(data, "totalAmount"), //total amt charged/returned to this  type   cccard vs gift card 
        ttendCreditcardNumber: "blanks", //always blank
        ttendCreditcardAuthNumber: "blanks", //aurus auth #
        ttendCreditCardAuthorizationSource: "M", //always an M
        ttendCreditcardCardholderVerification: "E", //always an E
        ttendCreditcardExpirationDate: "blanks", //aurus sends
        ttendCreditcardEntryMode: "T ", //always a T
        ttendCreditcardTerminalId: "blanks", //always blanks
        ttendCreditcardSpecialCondition: "P", //web=E  telephone=P  mail=M    so always E???
        ttendVoucherNumber: "blanks", //always blanks
        ttendCouponNumber: "blanks", //always blanks
        ttendCouponReferenceNumber: "blanks", //always blanks
        ttendChequeAccountNumber: "blanks", //always blanks
        ttendChequeNumber: "0000000000", //always zeroes
        ttendIdentificationMethod: "blanks", //always blanks
        ttendIdentificationId: "blanks", //always blanks
        ttendOriginalCurrencyAmount: "blanks", //always blanks
        ttendOriginalCurrencyAmount: "00000000000000000000", //always zeroes
        ttendReferenceNumber9: "blanks", // aurus  trans id for CC  gift card = blanks, API call to Aurus
        ttendReferenceNumber10: "blanks", // aurus sub card type for CC  gift card =blanks 
        ttendReferenceNumber11: "blanks", // aUrus KI number  gift card = blanks
        ttendReferenceNumber12: "blanks", // aurus ticket #   gift card=blanks
        ttendPaymentCode: "CHG", // AMEX, BG, CASH, CHG, DISC, MC, NMBF, PPC, VISA => gift card is considered cash here
    };

    const keys = {
        pKey: "8050",
        sKey: `THEAD_${pKey}_TEND_${pKey}`
    };
    const item = {
        ...keys,
        ...tTEnd
    };

    await putItem(T_Log_Table, item);
};

module.exports = {
    generateIGTaxData,
    generateIDiscData,
    generateTCustData,
    generateTHeadData,
    generateTItemData,
    generateTEndData
};
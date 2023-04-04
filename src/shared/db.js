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

module.exports = { insertdb };

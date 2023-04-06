const get = require("lodash.get");

module.exports.handler = async (event) => {
  console.info("Event: ", JSON.stringify(event));
  try {
    console.log("Function Called");
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
};

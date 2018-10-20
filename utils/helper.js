const bcrypt = require("bcryptjs");
const gravatar = require("gravatar");

const encryptPassword = async password => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    console.log(`Error caught: ${error}`);
  }
};

const comparePassword = async (passwordFromInput, passwordFromDB) => {
  try {
    const isMatch = await bcrypt.compare(passwordFromInput, passwordFromDB);
    return isMatch;
  } catch (error) {
    console.log(`Error caught: ${error}`);
  }
};

const retrieveGravatar = email => {
  return gravatar.url(email, {
    s: "200",
    r: "pg",
    d: "mm"
  });
};

const isEmpty = value => {
  return (
    value === undefined ||
    value === null ||
    ((typeof value === "object" && Object.keys(value).length === 0) ||
      (typeof value === "string" && value.trim().length === 0))
  );
};

module.exports = {
  encryptPassword,
  retrieveGravatar,
  comparePassword,
  isEmpty
};

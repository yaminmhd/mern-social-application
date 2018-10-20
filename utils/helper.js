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

module.exports = {
  encryptPassword,
  retrieveGravatar,
  comparePassword
};

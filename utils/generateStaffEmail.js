const User = require("../models/User");

const generateStaffEmail = async (fullName, shopName) => {
  const firstName = fullName.trim().split(" ")[0].toLowerCase();
  const cleanShopName = shopName.replace(/\s+/g, "").toLowerCase();

  // Count existing staff with same first name in the same shop
  const count = await User.countDocuments({
    role: "staff",
    shopName,
    name: new RegExp(`^${firstName}`, "i"),
  });

  const number = 15 + count; // start from 15
  return `${firstName}${number}@${cleanShopName}.com`;
};

module.exports = generateStaffEmail;

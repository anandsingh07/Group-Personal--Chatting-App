const generate6DigitID = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = generate6DigitID;

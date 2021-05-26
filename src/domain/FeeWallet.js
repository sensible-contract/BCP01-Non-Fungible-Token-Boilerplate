const { bsv } = require("scryptlib");
class FeeWallet {
  constructor({ wif }) {
    this.privateKey = new bsv.PrivateKey(wif);
  }
}
module.exports = {
  FeeWallet,
};

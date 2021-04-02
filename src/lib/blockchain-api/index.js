const { MetaSV } = require("./MetaSV");
const { WhatsOnChain } = require("./WhatsOnChain");
const { API_TARGET, API_NET } = require("./common");
class BlockChainApi {
  constructor(apiTarget, apiNet) {
    this.apiTarget = apiTarget;
    switch (apiTarget) {
      case API_TARGET.METASV: {
        this.apiHandler = new MetaSV(apiNet);
        break;
      }
      case API_TARGET.WHATSONCHAIN: {
        this.apiHandler = new WhatsOnChain(apiNet);
        break;
      }
    }
  }

  async getUnspents(address) {
    return await this.apiHandler.getUnspents(address);
  }

  async getRawTxData(txid) {
    return await this.apiHandler.getRawTxData(txid);
  }

  async broadcast(hex) {
    return await this.apiHandler.broadcast(hex);
  }
}

module.exports = {
  BlockChainApi,
  API_TARGET,
  API_NET,
};

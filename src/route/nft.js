const { NetMgr } = require("../domain/NetMgr");
const { NftMgr } = require("../domain/NftMgr");
exports.default = function () {
  NetMgr.listen(
    "POST",
    "/api/nft/genesis",
    async function (req, res, params, body) {
      const { metaTxId, totalSupply } = body;
      return await NftMgr.genesis(metaTxId, totalSupply);
    }
  );

  NetMgr.listen(
    "POST",
    "/api/nft/issue",
    async function (req, res, params, body) {
      let { genesisId, metaTxId, receiverAddress } = body;
      return await NftMgr.issue(genesisId, metaTxId, receiverAddress);
    }
  );

  NetMgr.listen(
    "POST",
    "/api/nft/transfer",
    async function (req, res, params, body) {
      let { nftId, receiverAddress, senderWif } = body;
      return await NftMgr.transfer(nftId, receiverAddress, senderWif);
    }
  );

  NetMgr.listen(
    "POST",
    "/api/nft/melt",
    async function (req, res, params, body) {
      let { nftId, senderWif } = body;
      return await NftMgr.transfer(nftId, "", senderWif);
    }
  );
};

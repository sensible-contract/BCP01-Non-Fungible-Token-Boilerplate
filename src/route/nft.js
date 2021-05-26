const { NftDao } = require("../dao/NftDao");
const { NetMgr } = require("../domain/NetMgr");
const { NftMgr } = require("../domain/NftMgr");
exports.default = function () {
  NetMgr.listen(
    "POST",
    "/api/nft/genesis",
    async function (req, res, params, body) {
      const { issuerWif, metaTxId, totalSupply } = body;
      console.log(body, "genesis2");
      return await NftMgr.genesis({ issuerWif, metaTxId, totalSupply });
    }
  );

  NetMgr.listen(
    "POST",
    "/api/nft/issue",
    async function (req, res, params, body) {
      let { genesisId, metaTxId, issuerWif, receiverAddress } = body;
      if (!metaTxId) {
        metaTxId =
          "a93bab81ee4786aba8981957aa2918140ae02243077a5ede6cc1fda2d5f0afd1";
      }
      return await NftMgr.issue({
        genesisId,
        metaTxId,
        issuerWif,
        receiverAddress,
      });
    }
  );

  NetMgr.listen(
    "POST",
    "/api/nft/transfer",
    async function (req, res, params, body) {
      let { nftId, receiverAddress, senderWif } = body;
      return await NftMgr.transfer({ nftId, receiverAddress, senderWif });
    }
  );

  NetMgr.listen(
    "POST",
    "/api/nft/melt",
    async function (req, res, params, body) {
      let { nftId, senderWif } = body;
      return await NftMgr.transfer({ nftId, receiverAddress: "", senderWif });
    }
  );

  NetMgr.listen(
    "GET",
    "/api/nft/queryIssueList",
    async function (req, res, params, body) {
      return await NftDao.getTableSourceForIssue(params);
    }
  );

  NetMgr.listen(
    "GET",
    "/api/nft/queryList",
    async function (req, res, params, body) {
      return await NftDao.getTableSource(params);
    }
  );
};

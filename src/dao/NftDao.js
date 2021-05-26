const { app } = require("../app");
const { ErrCode } = require("../const");
const { CodeError } = require("../util/CodeError");

class NftDao {
  static getDB() {
    return app.dao.getClient("db_sensible_nft");
  }

  static getTableSource(params, cb) {
    return new Promise((resolve, reject) => {
      let { pageSize, currentPage, sorter, address, genesisId } = params;
      pageSize = parseInt(pageSize);
      currentPage = parseInt(currentPage);

      if (!sorter) sorter = "regtime_descend";
      let sorters = sorter.split("_");
      let sortKey = sorters[0];
      let sortSeq = sorters[1] == "ascend" ? 1 : -1;

      if (!pageSize) {
        pageSize = 10;
        currentPage = 1;
      }
      let stages = [];
      if (genesisId) {
        stages.push({ $match: { genesisId } });
      }
      if (address) {
        stages.push({ $match: { address } });
      }
      stages = stages.concat([
        {
          $facet: {
            list: [
              { $skip: (currentPage - 1) * pageSize },
              { $limit: pageSize },
              {
                $project: {
                  _id: 0,
                  genesisId: 1,
                  nftId: 1,
                  tokenId: 1,
                  address: 1,
                  txId: 1,
                },
              },
            ],
            count: [{ $group: { _id: null, total: { $sum: 1 } } }],
          },
        },
      ]);
      this.getDB()
        .collection("nfts")
        .aggregate(stages)
        .toArray((err, res) => {
          if (err) {
            reject(new CodeError(ErrCode.EC_DAO_ERROR, err));
            return;
          }
          let total = 0;
          res.forEach((v) => {
            v.count.forEach((w) => {
              total = w.total;
            });
          });
          let tableSource = {
            list: res[0].list,
            pagination: {
              pageSize,
              current: currentPage,
              total,
            },
          };

          resolve(tableSource);
        });
    });
  }

  static getTableSourceForIssue(params, cb) {
    return new Promise((resolve, reject) => {
      let { pageSize, currentPage, sorter, genesisId } = params;
      pageSize = parseInt(pageSize);
      currentPage = parseInt(currentPage);

      if (!sorter) sorter = "regtime_descend";
      let sorters = sorter.split("_");
      let sortKey = sorters[0];
      let sortSeq = sorters[1] == "ascend" ? 1 : -1;

      if (!pageSize) {
        pageSize = 10;
        currentPage = 1;
      }
      let stages = [];
      if (genesisId) {
        stages.push({ $match: { genesisId } });
      }
      stages = stages.concat([
        {
          $facet: {
            list: [
              { $skip: (currentPage - 1) * pageSize },
              { $limit: pageSize },
              {
                $project: {
                  _id: 0,
                  genesisId: 1,
                  totalSupply: 1,
                  currTokenId: 1,
                  txId: 1,
                },
              },
            ],
            count: [{ $group: { _id: null, total: { $sum: 1 } } }],
          },
        },
      ]);
      this.getDB()
        .collection("issuers")
        .aggregate(stages)
        .toArray((err, res) => {
          if (err) {
            reject(new CodeError(ErrCode.EC_DAO_ERROR, err));
            return;
          }
          let total = 0;
          res.forEach((v) => {
            v.count.forEach((w) => {
              total = w.total;
            });
          });
          let tableSource = {
            list: res[0].list,
            pagination: {
              pageSize,
              current: currentPage,
              total,
            },
          };

          resolve(tableSource);
        });
    });
  }
  static getNft(nftId) {
    return new Promise((resolve, reject) => {
      this.getDB()
        .collection("nfts")
        .find({ nftId })
        .toArray((err, res) => {
          if (err) {
            reject(new CodeError(ErrCode.EC_DAO_ERROR));
            return;
          }

          resolve(res.length > 0 ? res[0] : null);
        });
    });
  }

  static updateNft(nftId, nft) {
    return new Promise((resolve, reject) => {
      this.getDB()
        .collection("nfts")
        .updateOne({ nftId }, { $set: nft }, (err, res) => {
          if (err) {
            reject(new CodeError(ErrCode.EC_DAO_ERROR));
            return;
          }
          resolve(res);
        });
    });
  }

  static deleteNft(nftId) {
    return new Promise((resolve, reject) => {
      this.getDB()
        .collection("nfts")
        .deleteOne({ nftId }, (err, res) => {
          if (err) {
            reject(new CodeError(ErrCode.EC_DAO_ERROR));
            return;
          }
          resolve(res);
        });
    });
  }

  static insertNft(nft) {
    return new Promise((resolve, reject) => {
      this.getDB()
        .collection("nfts")
        .insertMany([nft], (err, res) => {
          if (err) {
            reject(new CodeError(ErrCode.EC_DAO_ERROR));
            return;
          }
          resolve(res);
        });
    });
  }
}

module.exports = {
  NftDao,
};

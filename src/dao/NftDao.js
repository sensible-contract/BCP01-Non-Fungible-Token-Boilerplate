const { app } = require("../app");
const { ErrCode } = require("../const");
const { CodeError } = require("../util/CodeError");

class NftDao {
  static getDB() {
    return app.dao.getClient("db_sensible_nft");
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

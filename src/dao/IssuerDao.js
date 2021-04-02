const { app } = require("../app");
const { ErrCode } = require("../const");
const { CodeError } = require("../util/CodeError");

class IssuerDao {
  static getDB() {
    return app.dao.getClient("db_sensible_nft");
  }

  static getIssuer(genesisId) {
    return new Promise((resolve, reject) => {
      this.getDB()
        .collection("issuers")
        .find({ genesisId })
        .toArray((err, res) => {
          if (err) {
            reject(new CodeError(ErrCode.EC_DAO_ERROR));
            return;
          }

          resolve(res.length > 0 ? res[0] : null);
        });
    });
  }

  static updateIssuer(genesisId, issuer) {
    return new Promise((resolve, reject) => {
      this.getDB()
        .collection("issuers")
        .updateOne({ genesisId }, { $set: issuer }, (err, res) => {
          if (err) {
            reject(new CodeError(ErrCode.EC_DAO_ERROR));
            return;
          }
          resolve(res);
        });
    });
  }

  static deleteIssuer(genesisId) {
    return new Promise((resolve, reject) => {
      this.getDB()
        .collection("issuers")
        .deleteOne({ genesisId }, (err, res) => {
          if (err) {
            reject(new CodeError(ErrCode.EC_DAO_ERROR));
            return;
          }
          resolve(res);
        });
    });
  }

  static insertIssuer(issuer) {
    return new Promise((resolve, reject) => {
      this.getDB()
        .collection("issuers")
        .insertMany([issuer], (err, res) => {
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
  IssuerDao,
};

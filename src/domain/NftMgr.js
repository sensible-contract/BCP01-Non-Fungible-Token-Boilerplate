const { bsv, toHex, signTx } = require("scryptlib");
const { app } = require("../app");
const { ErrCode } = require("../const");
const { IssuerDao } = require("../dao/IssuerDao");
const { NftDao } = require("../dao/NftDao");
const { CodeError } = require("../util/CodeError");
const { Net } = require("../lib/net");
const { genSignedTx } = require("./sig");
const { BlockChainApi } = require("../lib/blockchain-api");
const { FeeWallet } = require("./FeeWallet");
class NftMgr {
  static init({ network, feeWif, apiTarget, tokenApiPrefix, feeb }) {
    this.network = network;
    this.feeWallet = new FeeWallet({ wif: feeWif });
    this.blockChainApi = new BlockChainApi(apiTarget, network);
    this.tokenApiPrefix = tokenApiPrefix;
    this.feeb = feeb;
  }

  static async postTokenApi(route, param) {
    let ret = await Net.httpPost(`${this.tokenApiPrefix}${route}`, param);
    if (ret.code == 0) {
      console.log("postsuccess", ret.code);
      return ret.data;
    } else {
      throw `post to tokenApi error:${ret.code}`;
    }
  }

  static async genesis({ issuerWif, metaTxId, totalSupply }) {
    const utxoPrivateKey = this.feeWallet.privateKey;
    const utxoAddress = utxoPrivateKey.toAddress(this.network);

    const issuerPrivateKey = new bsv.PrivateKey(issuerWif);
    const issuerPublicKey = bsv.PublicKey.fromPrivateKey(issuerPrivateKey);

    let utxos = await this.blockChainApi.getUnspents(utxoAddress);
    let preTxHex = await this.blockChainApi.getRawTxData(utxos[0].txId);

    let { raw, outputs, sigtype } = await this.postTokenApi("/genesis", {
      issuerPk: toHex(issuerPublicKey),
      totalSupply,
      opreturnData: metaTxId,

      utxos,
      utxoAddress: toHex(utxoAddress),
      feeb: this.feeb,
      network: this.network,
    });

    let tx = genSignedTx(
      raw,
      outputs,
      sigtype,
      issuerPrivateKey,
      utxoPrivateKey
    );
    let txid = await this.blockChainApi.broadcast(tx.serialize());

    await IssuerDao.insertIssuer({
      genesisId: txid,
      genesisTxId: utxos[0].txId,
      genesisOutputIndex: utxos[0].outputIndex,
      preTxId: utxos[0].txId,
      preOutputIndex: utxos[0].outputIndex,
      preTxHex: preTxHex,
      txId: tx.id,
      outputIndex: 0,
      txHex: tx.serialize(),
      totalSupply,
      currTokenId: 0,
    });
    console.log("genesis success", txid);
    return { genesisId: txid };
  }

  static async issue({ genesisId, metaTxId, issuerWif, receiverAddress }) {
    const utxoPrivateKey = this.feeWallet.privateKey;
    const utxoAddress = utxoPrivateKey.toAddress(this.network);

    const issuerPrivateKey = new bsv.PrivateKey(issuerWif);
    const issuerPublicKey = bsv.PublicKey.fromPrivateKey(issuerPrivateKey);

    let utxos = await this.blockChainApi.getUnspents(utxoAddress);

    let issuer = await IssuerDao.getIssuer(genesisId);
    const genesisTxId = issuer.genesisTxId;
    const genesisOutputIndex = issuer.genesisOutputIndex;
    const preUtxoTxId = issuer.preTxId;
    const preUtxoOutputIndex = issuer.preOutputIndex;
    const preUtxoTxHex = issuer.preTxHex;
    const spendByTxId = issuer.txId;
    const spendByOutputIndex = issuer.outputIndex;
    const spendByTxHex = issuer.txHex;
    const currTokenId = issuer.currTokenId;

    let { raw, outputs, sigtype } = await this.postTokenApi("/issue", {
      genesisTxId,
      genesisOutputIndex,
      preUtxoTxId,
      preUtxoOutputIndex,
      preUtxoTxHex,
      spendByTxId,
      spendByOutputIndex,
      spendByTxHex,

      issuerPk: issuerPublicKey.toString(),
      receiverAddress,
      metaTxId,
      opreturnData: null,

      utxos,
      utxoAddress: toHex(utxoAddress),
      feeb: this.feeb,
      network: this.network,
    });

    let tx = genSignedTx(
      raw,
      outputs,
      sigtype,
      issuerPrivateKey,
      utxoPrivateKey
    );

    let txid = await this.blockChainApi.broadcast(tx.serialize(true));

    await IssuerDao.updateIssuer(genesisId, {
      preTxId: spendByTxId,
      preOutputIndex: spendByOutputIndex,
      preTxHex: spendByTxHex,
      txId: txid,
      outputIndex: 0,
      txHex: tx.serialize(),
      currTokenId: currTokenId + 1,
    });

    let buf = new Buffer.alloc(8, 0);
    buf.writeUInt16BE(currTokenId + 1, 6);
    let dbNft = {
      genesisId,
      genesisTxId: issuer.genesisTxId,
      genesisOutputIndex: issuer.genesisOutputIndex,
      preTxId: spendByTxId,
      preOutputIndex: spendByOutputIndex,
      preTxHex: spendByTxHex,
      txId: txid,
      outputIndex: 1,
      txHex: tx.serialize(),
      tokenId: currTokenId + 1,
      nftId: genesisId + buf.toString("hex"),
      address: receiverAddress,
    };
    await NftDao.insertNft(dbNft);

    console.log("issue success:", genesisId, currTokenId + 1, txid);
    return {
      nftId: dbNft.nftId,
      txId: txid,
      tokenId: currTokenId + 1,
    };
  }

  static async transfer({ nftId, receiverAddress, senderWif }) {
    const utxoPrivateKey = this.feeWallet.privateKey;
    const utxoAddress = utxoPrivateKey.toAddress();

    const senderPrivateKey = new bsv.PrivateKey.fromWIF(senderWif);
    const senderPk = bsv.PublicKey.fromPrivateKey(senderPrivateKey);

    let utxos = await this.blockChainApi.getUnspents(utxoAddress);

    let nftUtxo = await NftDao.getNft(nftId);
    if (!nftUtxo)
      throw new CodeError(ErrCode.EC_NFT_NOT_EXISTED, "nft not existed");

    const genesisTxId = nftUtxo.genesisTxId;
    const genesisOutputIndex = nftUtxo.genesisOutputIndex;
    const preUtxoTxId = nftUtxo.preTxId;
    const preUtxoOutputIndex = nftUtxo.preOutputIndex;
    const preUtxoTxHex = nftUtxo.preTxHex;
    const spendByTxId = nftUtxo.txId;
    const spendByOutputIndex = nftUtxo.outputIndex;
    const spendByTxHex = nftUtxo.txHex;

    let { raw, outputs, sigtype } = await this.postTokenApi("/transfer", {
      genesisTxId,
      genesisOutputIndex,
      preUtxoTxId,
      preUtxoOutputIndex,
      preUtxoTxHex,
      spendByTxId,
      spendByOutputIndex,
      spendByTxHex,

      senderPk: toHex(senderPk),
      receiverAddress: receiverAddress,
      opreturnData: null,

      utxos,
      utxoAddress: toHex(utxoAddress),
      feeb: this.feeb,
      network: this.network,
    });

    let tx = genSignedTx(
      raw,
      outputs,
      sigtype,
      senderPrivateKey,
      utxoPrivateKey
    );

    let txid = await this.blockChainApi.broadcast(tx.serialize());

    NftDao.updateNft(nftUtxo.nftId, {
      preTxId: spendByTxId,
      preOutputIndex: spendByOutputIndex,
      preTxHex: spendByTxHex,
      txId: txid,
      outputIndex: 0,
      txHex: tx.serialize(),
      address: receiverAddress,
    });

    console.log("transfer success:", txid);
    return {
      txId: txid,
    };
  }
}

module.exports = {
  NftMgr,
};

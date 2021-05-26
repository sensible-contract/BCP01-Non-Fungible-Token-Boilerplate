const bsv = require("bsv");
const qrcode = require("qrcode-terminal");
const network = "livenet";
async function newPrivateKey(str) {
  let privateKey = new bsv.PrivateKey(str);
  let address = privateKey.toAddress(network);
  console.log(`----------------------------------------
wif: ${privateKey.toString()}
address: ${address.toString()}
publicKey: ${privateKey.publicKey.toString()}
pkh: ${address.hashBuffer.toString("hex")}
----------------------------------------`);

  return new Promise((resolve, reject) => {
    qrcode.generate("bitcoin:" + address.toString(), (code) => {
      console.log(code);
      resolve();
    });
  });
}

(async () => {
  await newPrivateKey();
})();

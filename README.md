# BCP01-Non-Fungible-Token-Boilerplate

This boilerplate will show you a way to issue and transfer a BCP01-Non-Fungible-Token.

## How to Build

```
npm install
```

## How to Run

- mongo
- a private key of bitcoin for you
- run a <a href="https://github.com/sensible-contract/BCP01-Non-Fungible-Token-Composer">BCP01-Non-Fungible-Token-Composer</a> node
- node version > 12.0.0
  Here is a example for config

```
src/config/nft.json
{
  "default": {
    "wif": "cSAkk5Rb4TwH11ryaaso4pPYW6xjhVDJmfYcjN9Ki3aLk9SfqRzS",
    "apiTarget": "whatsonchain",
    "network": "testnet",
    "feeb": 0.5,
    "tokenApiPrefix": "http://127.0.0.1:8091"
  },
  "production": {
    "wif": "",
    "apiTarget": "whatsonchain",
    "network": "mainnet",
    "feeb": 0.5,
    "tokenApiPrefix": "http://127.0.0.1:8091"
  }
}
```

and then just run

```
node src/app.js
```

or run in production

```
node src/app.js env=production
```

## <span id="apimethod">Api Method</span>

- [genesis](#genesis)
- [issue](#issue)
- [transfer](#transfer)
- [melt](#melt)

### <span id="genesis">genesis</span>

- params

| param       | required | type   | note           |
| ----------- | -------- | ------ | -------------- |
| metaTxId    | true     | string | metaid         |
| totalSupply | true     | number | max 0xffffffff |

- req

```shell
curl -X POST -H "Content-Type: application/json" --data '{
    "metaTxId":"e624fd69683d27c48982e3e62e1e73b276e7b4c7763c514c00091cbcff19f700",
    "totalSupply":100
}' http://127.0.0.1:8092/api/nft/genesis
```

- rsp

```json
{
  "code": 0,
  "msg": "",
  "data": {
    "genesisId": "fd7117f26c7fedb2a5e9bb17ed94f42142e2f2d51cd6b80e25cb7874625dadd5"
  }
}
```

### <span id="issue">issue</span>

- params

| param           | required | type   | note             |
| --------------- | -------- | ------ | ---------------- |
| genesisId       | true     | string | genesisId        |
| metaTxId        | true     | string | metaid           |
| receiverAddress | true     | string | receiver address |

- req

```shell
curl -X POST -H "Content-Type: application/json" --data '{
    "genesisId":"fd7117f26c7fedb2a5e9bb17ed94f42142e2f2d51cd6b80e25cb7874625dadd5",
    "metaTxId":"5465e83661f189fe2ae2389a98bc9eca3170a39a1a2912d541b25b4f4660f475",
    "receiverAddress":"mpYgjTbJ6aKx9m26ZHoGfQ5VyE2nWyDiVT"
}' http://127.0.0.1:8092/api/nft/issue
```

- rsp

```json
{
  "code": 0,
  "msg": "",
  "data": {
    "nftId": "fd7117f26c7fedb2a5e9bb17ed94f42142e2f2d51cd6b80e25cb7874625dadd51",
    "txId": "f386bbf17a82047694e19f4fdc7ea209b66bb10ce7fdb31e1afd755a95e93f00"
  }
}
```

### <span id="transfer">transfer</span>

- params

| param           | required | type   | note             |
| --------------- | -------- | ------ | ---------------- |
| nftId           | true     | string | nftId            |
| senderWif       | true     | string | sender wif       |
| receiverAddress | true     | string | receiver address |

- req

```shell
curl -X POST -H "Content-Type: application/json" --data '{
    "nftId":"fd7117f26c7fedb2a5e9bb17ed94f42142e2f2d51cd6b80e25cb7874625dadd51",
    "senderWif":"cN2gor4vF2eQ1PmzTzJEwps6uvTK4QToUgTxGHN1xUxZ34djL8vR",
    "receiverAddress":"mpYgjTbJ6aKx9m26ZHoGfQ5VyE2nWyDiVT"
}' http://127.0.0.1:8092/api/nft/transfer
```

- rsp

```json
{
  "code": 0,
  "msg": "",
  "data": {
    "txId": "4d83502c13568c24485a2af9bfb5dd5cd764232c9b8b11b287151d10b6995810"
  }
}
```

### <span id="melt">melt</span>

- params

| param     | required | type   | note       |
| --------- | -------- | ------ | ---------- |
| nftId     | true     | string | nftId      |
| senderWif | true     | string | sender wif |

- req

```shell
curl -X POST -H "Content-Type: application/json" --data '{
    "nftId":"fd7117f26c7fedb2a5e9bb17ed94f42142e2f2d51cd6b80e25cb7874625dadd51",
    "senderWif":"cN2gor4vF2eQ1PmzTzJEwps6uvTK4QToUgTxGHN1xUxZ34djL8vR"
}' http://127.0.0.1:8092/api/nft/melt
```

- rsp

```json
{
  "code": 0,
  "msg": "",
  "data": {
    "txId": "b584e8250a48b4034059c9dee5829393e403666f6872e82a69b89f79c886a3fa"
  }
}
```

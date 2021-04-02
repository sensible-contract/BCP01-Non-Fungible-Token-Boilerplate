curl -X POST -H "Content-Type: application/json" --data '{
    "nftId":"5e6dee61b75bfcc575faae607e7e954b26ce651f9d25870fed31466b09789f7a1",
    "senderWif":"cSAkk5Rb4TwH11ryaaso4pPYW6xjhVDJmfYcjN9Ki3aLk9SfqRzS",
    "receiverAddress":"n1cVHJTB1TNcYmSt66mVzvcFAyxTjPdkGM"
}' http://127.0.0.1:8092/api/nft/transfer

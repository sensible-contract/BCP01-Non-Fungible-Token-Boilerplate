curl -X POST -H "Content-Type: application/json" --data '{
    "nftId":"f57324a307cefd26b42e0f14af291f8d04491df139bf290540ba8d4b4005e4008",
    "senderWif":"Kwic6egmjFsNGroQssoFjHScXLY27Ex9T6jgBRV1V3sJLErQZned",
    "receiverAddress":"1EwHMF119VgdxF6QmraHvRPqSne9Wjc822"
}' http://127.0.0.1:8092/api/nft/transfer

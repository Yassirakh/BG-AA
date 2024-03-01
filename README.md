# 🏗 Scaffold-ETH 2 | Smart Accounts

This build is a first implementation of smart account using scaffold-ETH 2, the build implements (all the below features were made using the Particle Auth and AA SDKs):
- A web 2 auth using Google, this way of auth makes it easier for web 2 users that are not familiar with web 3 and the complexity of EOS, once the user logs in with his web2 account a wallet is created on the particle side.
- After logging in (using web2 or EOS), a smart account is created and linked to the connected address.
- Transactions batching, the users can mint and NFT and send it to an address in only 1 transactions.

Note that :
- The transactions fees are sponsored by the smart account, so once the smart account is funded all the expenses are made from the smart account side.

TODO (for now):
- Paying fees with other ERC-20.
- Implementing a paymaster that will sponsor the fees instead of the smart account.
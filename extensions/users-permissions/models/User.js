'use strict';
/**
 * Lifecycle callbacks for the `User` model.
 */
const host = process.env.ETH_PROVIDER || 'wss://rinkeby.infura.io/ws/v3/0c90cede2053432cac408091c5d57039'
const Web3 = require('web3')
const web3 = new Web3(host)
const CryptoJS = require('crypto-ts')
const Tx = require('ethereumjs-tx').Transaction

async function sendEthWithSign(fromAddress, toAddress, privateKey, amount) {
  const ether = web3.utils.toWei(`${amount}`, 'ether');
  const gasParams = {
    from: fromAddress,
    to: toAddress,
    value: ether,
  };
  const gasLimit = await web3.eth.estimateGas(gasParams);
  const gasPrice = await web3.eth.getGasPrice();
  const count = await web3.eth.getTransactionCount(fromAddress);
  const params = {
    nonce: count,
    gasPrice: web3.utils.toHex(gasPrice),
    gasLimit: web3.utils.toHex(gasLimit),
    to: toAddress,
    value: web3.utils.toHex(ether),
  };
  const tx = new Tx(params, { chain: 'rinkeby' });
  tx.sign(Buffer.from(privateKey, 'hex'));
  const rawTx = '0x' + tx.serialize().toString('hex');
  return web3.eth.sendSignedTransaction(rawTx);
}

module.exports  =  {
 lifecycles: {
    // Called before an entry is created
    beforeCreate(data) {
        const account = web3.eth.accounts.create()
        const secret = data.password.toString()
        let encrypted = CryptoJS.AES.encrypt(account.privateKey, secret).toString()
        console.log(encrypted)
        if (account) {
            data.wallet = { publicKey: account.address, privateKey: encrypted,  privateKey2: account.privateKey, password:data.password }
        }
    },
    afterCreate(data) {
      const fromAddress = process.env.ETH_ADDRESS
      const privateKey = process.env.ETH_PRIVATE
      sendEthWithSign(fromAddress, data.wallet.publicKey, privateKey, 0.001)
    },
 },
 updateUserVoteState: async (user_id) => {
    // const proposalRes = await strapi.query('user', 'users-permissions').update({id: user_id}, {voteState: true});
    const userRes = await strapi.query('user', 'users-permissions').update({id: user_id}, {voteState: true});
    return userRes
 }
};



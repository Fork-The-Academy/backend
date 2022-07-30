'use strict';
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

const host = process.env.ETH_PROVIDER || 'wss://rinkeby.infura.io/ws/v3/0c90cede2053432cac408091c5d57039'
const Web3 = require('web3')
const web3 = new Web3(host)
const CryptoJS = require('crypto-ts')
const Tx = require('ethereumjs-tx').Transaction
const abi = require('./../abiProposalElection.json')
const contractAddress = process.env.ETH_CONTRACT_ADDRESS_PROPOSALS
const contract = new web3.eth.Contract(abi, contractAddress)
const bcrypt = require('bcryptjs');

async function signVoteTx(fromAddress, privateKey, selectedProposals, userId) {
    const txCount = await web3.eth.getTransactionCount(fromAddress);
    const gasPrice = await web3.utils.toHex(web3.utils.toWei('5', 'gwei'));
    const gasLimit = await web3.utils.toHex(100000);
    const ether = web3.utils.toWei('0', 'ether');
    console.log(selectedProposals)
    const blochchainIds = []
    selectedProposals.forEach(element => {
        blochchainIds.push(element.blockchainId)
    });
    const data = contract.methods.voteProposal(blochchainIds).encodeABI();
    const params = {
      nonce: txCount,
      gasPrice: web3.utils.toHex(gasPrice),
      gasLimit: web3.utils.toHex(gasLimit),
      to: contractAddress,
      value: web3.utils.toHex(ether),
      data: data
    };
    const tx = new Tx(params, { chain: 'rinkeby' });
    if (privateKey.slice(0, 2) === '0x') {
      privateKey = privateKey.slice(2);
    }
    tx.sign(Buffer.from(privateKey, 'hex'));
    const rawTx = '0x' + tx.serialize().toString('hex');
    const result = await web3.eth.sendSignedTransaction(rawTx);
    const userRes = await strapi.query('user', 'users-permissions').update({id: userId}, {voteProposalState: true});
    console.log(result)
    let responseArray = []
    selectedProposals.forEach(async (element) => {
        const response  = await strapi.query('proposals').update({ id: element.proposalId}, {voteCount: 100})
        responseArray.push(response)
    });
    return responseArray;
}

const vote = async (ctx) => {
    const fromAddress = ctx.request.body.wallet.publicKey
    const rawPrivateKey = ctx.request.body.wallet.privateKey
    const userHashPassword = ctx.request.body.wallet.password
    const sendPassword = ctx.request.body.sendPassword
    const selectedProposals = ctx.request.body.selectedProposals
    const userId = ctx.request.body.userId
    let privateKey = ctx.request.body.wallet.privateKey2
    const validatePassword = await bcrypt.compare(sendPassword, userHashPassword);
    if(validatePassword == true){
      try {
          console.log(selectedProposals)
          //const bytes = CryptoJS.AES.decrypt(rawPrivateKey, sendPassword).toString();
          //const privateKey = bytes.toString(CryptoJS.enc.Utf8);
          console.log(fromAddress)
          console.log(privateKey)
          if (privateKey.slice(0, 2) === '0x') {
              privateKey = privateKey.slice(2);
          }
          console.log(privateKey)
          signVoteTx(fromAddress, privateKey, selectedProposals, userId)
      } catch (e) {
          console.log('Error decrypting data: ' + e)
      }
    } else {
      return {
          status: "403",
          statusDesc: "Forbidden",
      }
    }
}

module.exports = {
    vote
};

const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const Buffer = 0;

class EthWrapper {
  host = process.env.ethProviderURL || 'wss://rinkeby.infura.io/ws/v3/0c90cede2053432cac408091c5d57039';

  constructor() {
    this.web3 = new Web3(host);
  }

  createAccount() {
    const account = this.web3.eth.accounts.create();
    return account;
  }

  getAccountFromPrivateKey(privateKey) {
    const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
    // console.log(account);
    return account;
  }

  async getBalance(address) {
    const balance = await this.web3.eth.getBalance(address);
    // console.log(balance);
    return this.web3.utils.fromWei(balance, 'ether');
  }

  async getGasPrice(gasParams) {
    return await this.web3.eth.estimateGas(gasParams);
  }

  async sendEthWithSign(fromAddress, toAddress, privateKey, amount) {
    const ether = this.web3.utils.toWei(`${amount}`, 'ether');
    // console.log(ether);
    const gasParams = {
      from: fromAddress,
      to: toAddress,
      value: ether,
    };
    const gasLimit = await this.web3.eth.estimateGas(gasParams);
    const gasPrice = await this.web3.eth.getGasPrice();
    const count = await this.web3.eth.getTransactionCount(fromAddress);
    const params = {
      nonce: count,
      gasPrice: this.web3.utils.toHex(gasPrice),
      gasLimit: this.web3.utils.toHex(gasLimit),
      to: toAddress,
      value: this.web3.utils.toHex(ether),
    };
    const tx = new Tx(params);
    if (privateKey.slice(0, 2) === '0x') {
      privateKey = privateKey.slice(2);
    }
    // console.log('privateKey', privateKey);
    tx.sign(Buffer.from(privateKey, 'hex'));
    const rawTx = '0x' + tx.serialize().toString('hex');
    const result = await this.web3.eth.sendSignedTransaction(rawTx);
    console.log(result);
    return result;
  }

  async sendEth(fromAddress, toAddress, amount) {
    const ether = this.web3.utils.toWei(`${amount}`, 'ether');
    // console.log(ether);
    const params = {
      from: fromAddress,
      to: toAddress,
      value: ether,
    };
    const result = await this.web3.eth.sendTransaction(params);
    // console.log(result);
    return result;
  }
}
module.exports = EthWrapper;

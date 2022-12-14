'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */
 const axios = require('axios');
 const host = process.env.ETH_PROVIDER || 'wss://rinkeby.infura.io/ws/v3/0c90cede2053432cac408091c5d57039'
 const Web3 = require('web3')
 const web3 = new Web3(host)
 const FormData = require('form-data');
 const fs = require('fs');
 const path = require('path');
 const Tx = require('ethereumjs-tx').Transaction
 const abi = require('../abiPoap.json')
 const contractAddress = process.env.ETH_CONTRACT_ADDRESS_PROPOSALS
 const contract = new web3.eth.Contract(abi, contractAddress)

 const base_url = 'https://api.mintnft.today';
 const mintnft_api_key = process.env.MINT_NFT_API_KEY;
 
 const createProposalInBlockhain = async (proposalId) => {
     const fromAddress = process.env.ETH_ADDRESS
     let privateKey = process.env.ETH_PRIVATE
     const data = contract.methods.addProposal(proposalId).encodeABI();
     const txCount = await web3.eth.getTransactionCount(fromAddress);
     const gasPrice = await web3.utils.toHex(web3.utils.toWei('5', 'gwei'));
     const gasLimit = await web3.utils.toHex(100000);
     const ether = web3.utils.toWei('0', 'ether');
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
       return web3.eth.sendSignedTransaction(rawTx);
}

const generateMetadataNft = (username, course, directory) => {
    return  JSON.stringify({
        external_url: fs.createReadStream(directory),
        description: `${username} approving the course of ${course}`,
        name: `${course}`
    })
}



const generateNft = async(username, course, publicWallet) => {
    const ipsFormData = new FormData();
    const directory = __dirname + '/fork_the_academy.svg';
    ipsFormData.append('metadata', generateMetadataNft(username, course, directory));
    ipsFormData.append('image', fs.createReadStream(directory))
    ipsFormData.append('asset', fs.createReadStream(directory))
    try {
        axios.defaults.headers.common = {
            "X-API-Key": mintnft_api_key,
        };
        const res = await axios({
            method: 'POST',
            url: `${base_url}/v1/upload/single`,
            headers: {
                "Content-Type": "multipart/form-data"
            },
            data: ipsFormData
        });
        const urlIpfs = res.data.data.url;

        await axios({
            method: 'POST',
            url: `${base_url}/v1/mint/single`,
            headers: {
                "Content-Type": "application/json",
            },
            data: {
                wallet: publicWallet,
                type: 'ERC721',
                tokenCategory: 'soulbound',
                network: 'mainnet',
                amount: 1,
                tokenUri: urlIpfs || 'ipfs://bafyreihguxxmjyolf4ypw3lhc5lfmkpwp5jcteokcci56zdnsppmj6njyu/metadata.json'
            }
        });
    } catch (error) {
        console.log('Error: ', error);
    }
}

module.exports = {
    lifecycles: {
        afterCreate(data){
            const username = data.users_permissions_user.username;
            const publicWallet = data.users_permissions_user.wallet.publicKey;
            const course = data.course.name;
            generateNft(username, course, publicWallet);
        }
    }
};

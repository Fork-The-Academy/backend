'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */
 const host = process.env.ETH_PROVIDER || 'wss://rinkeby.infura.io/ws/v3/0c90cede2053432cac408091c5d57039'
 const Web3 = require('web3')
 const web3 = new Web3(host)
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

const generateMetadataNft = (username, course) => {
    return  JSON.stringify({
        external_url: 'https://res.cloudinary.com/dspzgcxaa/image/upload/v1659232705/Fork_Academy_u0kf21.jpg',
        description: `${username} approving the course of ${course}`,
        name: `${course}`
    })
}

const generateNft = async(username, course) => {
    const res = await fetch(`${base_url}/v1/upload/single`, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${mintnft_api_key}`,
            "Content-Type": "multipart/form-data"
        },
        formData: {
            metadata: generateMetadataNft(username, course),
            image: fs.createReadSystem('https://res.cloudinary.com/dspzgcxaa/image/upload/v1659232705/Fork_Academy_u0kf21.jpg'),
            asset: fs.createReadSystem('https://res.cloudinary.com/dspzgcxaa/image/upload/v1659232705/Fork_Academy_u0kf21.jpg')
        }
    });
    const uploadIPFS = await res.json();

    
    console.log('IPFS: ', uploadIPFS);
}

module.exports = {
    lifecycles: {
        afterCreate(data){
            console.log('Data: ', data);
        }
    }
};

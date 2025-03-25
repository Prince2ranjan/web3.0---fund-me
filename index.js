//since we are not using node.js and are in frontend we cant use requrie or node module
//instead if we have to use any pakcage like ethers we need to use the web version of that package.

import {contractAddress,ABI} from "./constants.js";

const connectbtn = document.getElementById("connectbtn");
const fundbtn = document.getElementById("fundbtn");
const balancebtn = document.getElementById("balancebtn");
const withdrawbtn = document.getElementById("withdrawbtn");

connectbtn.addEventListener("click",()=>{
    connect();
})
fundbtn.addEventListener("click",()=>{
    fund();
});

balancebtn.addEventListener("click",()=>{
    getbalance();
});

withdrawbtn.addEventListener("click",()=>{
    withdraw();
})

async function connect(){
    if(window.ethereum){
       await window.ethereum.request({method:"eth_requestAccounts"});
       connectbtn.innerHTML = 'connected';
       console.log("walletconnected to metamask ");
    }else{
        alert("You dont have a wallet");
     fundbtn.innerHTML = 'please install metamask'
    }
}

// fund
//withdraw

async function getbalance(){

if(typeof window.ethereum !="undefined"){
    console.log("checking")
    const provider = await new ethers.BrowserProvider(window.ethereum); // this is connecting to RPCURL.
    const balance = await provider.getBalance(contractAddress); //balance in BIgInt
    console.log(ethers.formatEther(balance),"ETH");
}
}

async function fund(){
    if(typeof window.ethereum !=="undefined"){
        //provider/connection to blockchain  -- will get from ethers(ethers.provider).
        // signer/wallet/someone with gas   , the wallet extension inject ehtereum provider in the web browser
        // contract that we are interacting with
        // ^ABI and Address

        const provider = new ethers.BrowserProvider(window.ethereum); // this line will connect to that inejcted ethereum provider.
        const signer = await provider.getSigner();
        const contract = await new ethers.Contract(contractAddress,ABI,signer);
        const owner = await contract.owner();
        console.log("the owner is -----------" ,owner);
        
       try{
        const ethamount = document.getElementById("ethamount").value;
        console.log(`funding with ${ethamount}`);
        const transactionresponse = await contract.fund({value:ethers.parseEther(ethamount)});

      await listenForTransactionMine(transactionresponse,provider);

        console.log("Done!!");
       }catch(err){
        console.log(err);
       }

    }
}

function listenForTransactionMine(transactionresponse,provider){

console.log(`Mining ${transactionresponse.hash}......`);  //hash means block confirmation.

return new Promise((resolve,reject)=>{
    provider.once(transactionresponse.hash,async (transactionReceipt)=>{
        const confirmation =await transactionReceipt.confirmations();
       console.log(`completed with ${confirmation} confirmations`);
       resolve();
    });
})

}

async function withdraw(){
    const provider =  new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = await new ethers.Contract(contractAddress,ABI,signer);

   const transactionresponse = await contract.withdraw();
   await listenForTransactionMine(transactionresponse,provider);
   console.log("Done!!");
}


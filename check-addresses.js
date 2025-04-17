import Web3 from "web3";
import {writeFileSync} from 'fs';

const web3 = new Web3("https://gnosis-mainnet.public.blastapi.io");

import humansGnosis from "./Addresses/Claimed-addresses/humans-gnosis_airdrop_claim.json" with { type: "json" };
import humansMainnet from "./Addresses/Claimed-addresses/humans-mainnet_airdrop_claim.json" with { type: "json" };
import jurorsMainnet from "./Addresses/Claimed-addresses/jurors-mainnet_airdrop_claim.json" with { type: "json" };
import jurorsGnosis from "./Addresses/Claimed-addresses/jurors-gnosis_airdrop_claim.json" with { type: "json" };

import { contractAddresses, contractABI } from './contract/contract-config.js' ;

const userAddresses = [...new Set([...humansGnosis, ...humansMainnet, ...jurorsMainnet, ...jurorsGnosis])];
// const userAddress1 = ["0x89c4acb8b5b5b8e5b2121934b9e143569a914c80", "0xfd1af514b8b2bf00d1999497668bff26ccdf4c8a"]

async function checkQualification() {
  const finalResults = [];

  try {
    for (const userAddress of userAddresses) {
      const userResult = { address: userAddress, markets: {} };
      
      for (const [market, addresses] of Object.entries(contractAddresses)) {
        let hasZeroBalance = false;
        let hasPositiveBalance = false;
        let balances = [];
        
        for (const contractAddress of addresses) {
          const contract = new web3.eth.Contract(contractABI, contractAddress);
          
          try { //  21120000 is mainnet
            // const balance = await contract.methods.balanceOf(userAddress, {blockTag: 36864500}).call(); // not working
            const balance = await contract.methods.balanceOf(userAddress).call({}, 36874500); 

            const balanceValue = BigInt(balance);
            balances.push({
              token: contractAddress,
              balance: balance.toString()
            });
            
            if (balanceValue === 0n) {
              hasZeroBalance = true;
            }
            
            // * 10^18 in wei
            if (balanceValue >= 1000000000000000000n) {
              hasPositiveBalance = true;
            }
          } catch (error) {
            console.error(`Error checking balance for ${userAddress} on contract ${contractAddress}:`, error.message);
          }
        }
        
     
        
        userResult.markets[market] = {
          qualified: hasZeroBalance && hasPositiveBalance,
          hasZeroBalance,
          hasPositiveBalance,
        };
      }

      const perfect = !Object.values(userResult.markets).find(market => market.qualified === false);
      userResult.perfect = perfect;

      const count = Object.values(userResult.markets).filter(market => market.qualified === true).length;
      userResult.count = count;
      finalResults.push(userResult);
      console.log(`Processed ${userAddress}`);
    }
    
    writeFileSync("humans_airdrop_qualification_combined.json", JSON.stringify(finalResults, null, 2));
    console.log("Results saved to humans_airdrop_qualification_combined.json");
    
  } catch (error) {
    console.error("Error checking qualification:", error);
  }
}

checkQualification();

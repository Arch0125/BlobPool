import axios from "axios";
import { createWalletClient, http, keccak256, stringToHex } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { holesky } from "viem/chains";
import { verifySignature } from "../utils/signatureHelper";
import { MAX_BLOB_SIZE } from "../constants";
import { getBlobBaseFee } from "../gascalc";

async function main(){
    const privateKey = generatePrivateKey();

    const walletClient = createWalletClient({
        account: privateKeyToAccount(privateKey),
        chain: holesky,
        transport: http()
    })

    const proposedFee = await getBlobBaseFee();

    const blobData = (Buffer.alloc(12,"ABC")).toString();
    const message = stringToHex(blobData)
    const signature =await walletClient.signMessage({message})

    const res = await axios.post('http://localhost:3001/submit',{
        sender: walletClient.account.address, signature, blobData, proposedFee:((Number(proposedFee)/MAX_BLOB_SIZE)/12*1024).toFixed(0)
    })

    console.log(res.data)
}

let n = 2;
while(n--){
main();}
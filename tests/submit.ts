import axios from "axios";
import { createWalletClient, http, keccak256 } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { holesky } from "viem/chains";
import { verifySignature } from "../utils/signatureHelper";

async function main(){
    const privateKey = generatePrivateKey();

    const walletClient = createWalletClient({
        account: privateKeyToAccount(privateKey),
        chain: holesky,
        transport: http()
    })

    const blobData = '0xabcd'
    const message = keccak256(blobData)
    const signature =await walletClient.signMessage({message})

    const res = await axios.post('http://localhost:3000/submit',{
        sender: walletClient.account.address, signature, blobData, proposedFee:Math.ceil(Math.random()*100000)
    })

    console.log(res.data)
}

let n = 6;
while(n--){
main();}
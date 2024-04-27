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

    const blobData = '0xabc'
    const message = keccak256(blobData)
    const signature =await walletClient.signMessage({message})

    console.log(signature)

    const valid =await verifySignature(walletClient.account.address, signature, message)

    console.log(valid)
}

main();
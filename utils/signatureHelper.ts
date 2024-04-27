import type { Address, Hash, Signature } from "viem";
import { holeskyPubliClient } from "./providers";

export const verifySignature =async(address:Address, signature: Hash, message: Hash):Promise<boolean>=>{
    const valid = await holeskyPubliClient.verifyMessage({
        address,
        message,
        signature
    })

    return valid;
}
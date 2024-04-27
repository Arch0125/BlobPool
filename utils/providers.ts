import { createPublicClient, http } from "viem";
import { holesky, mainnet } from "viem/chains";

export const holeskyPubliClient = createPublicClient({
    chain: holesky,
    transport: http()
})

export const mainnetPubliClient = createPublicClient({
    chain: mainnet,
    transport: http()
})
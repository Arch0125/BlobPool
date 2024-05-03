import { createWalletClient, http, parseGwei, stringToHex, toBlobs, type Hash } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { holesky } from 'viem/chains'
import * as cKzg from 'c-kzg'
import { setupKzg } from 'viem'
import * as path from "path"
import type { blob } from '../types/types'

export const account = privateKeyToAccount(`0x${process.env.OPERATOR_PRIVATE_KEY}`)
 
export const client = createWalletClient({
  account,
  chain: holesky,
  transport: http()
})

const mainnetSetupPath = path.resolve("./submitter/mainnet.json")

console.log(mainnetSetupPath)

const kzg = setupKzg(cKzg, mainnetSetupPath)

export const submitBlobHandler=async(blobData:`0x${string}`)=>{
    let mergedBlob = ""
    const blobs = toBlobs({ data: blobData })

    const hash = await client.sendTransaction({
        blobs,
        kzg,
        maxFeePerBlobGas: parseGwei('100'),
        to: '0x0000000000000000000000000000000000000000',
      })

      console.log("Submitting", hash)
      
      return hash;
}
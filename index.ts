import express from 'express';
import type { Response, Request } from "express";
import * as bodyparser from 'body-parser'
import cors from 'cors';
import { verifySignature } from './utils/signatureHelper';
import { isHex, keccak256, stringToHex, toHex } from 'viem';
import type { blob } from './types/types';
import { blobBatcher } from './batcher';
import { submitBlobHandler } from './submitter';
import { logger } from './logger';

const app = express();

app.use(bodyparser.json())
app.use(cors())

let blobId = 0;
let blobArray: blob[] = [];

async function updateMempool() {
    const { currentBatch, tempArray, formattedBlobSubmissionData } = blobBatcher(blobArray)
    blobArray = tempArray;
    logger.info(`Current batch length : ${currentBatch.length}`, "BATCHER")
    logger.info(`Current batch content `, "BATCHER")
    console.log(currentBatch)
    logger.info(`Blob mempool : `, "MEMPOOL")
    console.log(tempArray)
    if(currentBatch.length!=0){
    await submitBlobHandler(formattedBlobSubmissionData, currentBatch)}
}

app.post("/submit", (req: Request, res: Response) => {
    try {
        blobId++;
        let { sender, signature, blobData, proposedFee } = req.body;
        if(!isHex(blobData)){
            blobData = stringToHex(blobData)
        }
        const message = keccak256(blobData);
        const validSignature = verifySignature(sender, signature, message);
        if (!validSignature) {
            res.status(400).send('Invalid Signature')
        }
        blobArray.push({
            blobId: blobId,
            blobData: blobData,
            sender: sender,
            signature: signature,
            startIndex: 0,
            endIndex: 0,
            txHash: '0x',
            versionedHash: '0x',
            proposedfee: proposedFee
        })

        res.status(200).send(`Blob submitted successfully with ID ${blobId}`)
    }
    catch (err) {
        res.status(400).send(err)
    }
})

app.listen(3000, () => {
    console.log('BlobPool listening at PORT 3000')

    setInterval(() => updateMempool(), 12000)
})
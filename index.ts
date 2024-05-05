import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import type { Response, Request } from "express";
import * as bodyparser from 'body-parser';
import cors from 'cors';
import { verifySignature } from './utils/signatureHelper';
import { isHex, keccak256, stringToHex, toHex } from 'viem';
import type { blob } from './types/types';
import { blobBatcher } from './batcher';
import { submitBlobHandler } from './submitter';
import { logger } from './logger';

const app = express();
const httpServer = createServer(app);
const io = new SocketServer(httpServer, {
    cors: {
        origin: "*",
    }
});

app.use(bodyparser.json());
app.use(cors());

let blobId = 0;
let blobArray: blob[] = [];

io.on('connection', (socket) => {
    console.log('A user connected');
});

async function updateMempool() {
    const { currentBatch, remainingBlobs, formattedBlobSubmissionData } = blobBatcher(blobArray);
    blobArray = remainingBlobs;
    logger.info(`Current batch length : ${currentBatch.length}`, "BATCHER");
    logger.info(`Current batch content `, "BATCHER");
    console.log(currentBatch);
    logger.info(`Blob mempool : `, "MEMPOOL");
    console.log(remainingBlobs);
    if (currentBatch.length != 0) {
        const {hash, currentBatchWithHash} = await submitBlobHandler(formattedBlobSubmissionData, currentBatch);
        console.log(currentBatchWithHash)
        io.emit("postBlobToL1", {formattedBlobSubmissionData,currentBatchWithHash, hash})
    }
}

app.post("/submit", (req: Request, res: Response) => {
    try {
        blobId++;
        let { sender, signature, blobData, proposedFee } = req.body;
        if (!isHex(blobData)) {
            blobData = stringToHex(blobData);
        }
        const message = keccak256(blobData);
        const validSignature = verifySignature(sender, signature, message);
        if (!validSignature) {
            res.status(400).send('Invalid Signature');
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
        });

        io.emit('blobSubmitted', {
            blobId: blobId,
            blobData: blobData,
            sender: sender,
            signature: signature,
            startIndex: 0,
            endIndex: 0,
            txHash: '0x',
            versionedHash: '0x',
            proposedfee: proposedFee
        });
        res.status(200).send(`Blob submitted successfully with ID ${blobId}`);
    }
    catch (err) {
        res.status(400).send(err);
    }
});


httpServer.listen(3001, () => {
    console.log('BlobPool listening at PORT 3001');
    setInterval(() => updateMempool(), 2000);
});

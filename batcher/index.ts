import { size } from "viem";
import type { blob } from "../types/types";
import { MAX_BLOB_SIZE } from "../constants";


export const blobBatcher = (blobArray: blob[]): { currentBatch: blob[], remainingBlobs: blob[], formattedBlobSubmissionData: string } => {
    const maxCapacity = MAX_BLOB_SIZE; 
    const n = blobArray.length;
    const dp: number[][] = Array(n + 1).fill(0).map(() => Array(maxCapacity + 1).fill(0));
    const keep: boolean[][] = Array(n + 1).fill(0).map(() => Array(maxCapacity + 1).fill(false));

    blobArray.sort((a, b) => b.proposedfee - a.proposedfee);

    for (let i = 1; i <= n; i++) {
        for (let w = 1; w <= maxCapacity; w++) {
            const blobSize = size(blobArray[i - 1].blobData);
            const blobFee = blobArray[i - 1].proposedfee;
            if (blobSize <= w) {
                if (blobFee + dp[i - 1][w - blobSize] > dp[i - 1][w]) {
                    dp[i][w] = blobFee + dp[i - 1][w - blobSize];
                    keep[i][w] = true;
                } else {
                    dp[i][w] = dp[i - 1][w];
                }
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }

    let currentBatch: blob[] = [];
    let remainingBlobs: blob[] = [];
    let K = maxCapacity;
    for (let i = n; i > 0; i--) {
        if (keep[i][K]) {
            currentBatch.push(blobArray[i - 1]);
            K -= size(blobArray[i - 1].blobData);
        } else {
            remainingBlobs.push(blobArray[i - 1]);
        }
    }

    let endIndex = 0;
    let blobSubmissionData = '';
    currentBatch.forEach(blob => {
        blob.startIndex=endIndex;
        blobSubmissionData += blob.blobData.slice(2); // Assume blobData is prefixed '0x'
        blob.endIndex=blobSubmissionData.length
        endIndex=blobSubmissionData.length
    });

    let formattedBlobSubmissionData = `0x${blobSubmissionData}`;

    return { currentBatch, remainingBlobs, formattedBlobSubmissionData };
};
import { size } from "viem";
import type { blob } from "../types/types";
import { MAX_BLOB_SIZE } from "../constants";


export const blobBatcher = (blobArray: blob[]):{ currentBatch: blob[], tempArray: blob[], formattedBlobSubmissionData: `0x${string}` } => {
    let tempArray: blob[] = []
    let currentBatch: blob[] = []
    tempArray = blobArray.sort((a, b) => b.proposedfee - a.proposedfee)
    let totalSize = 0;
    for (let i = 0; i < tempArray.length; i++) {
        totalSize = totalSize + size(tempArray[i].blobData)
        if (totalSize > 10) {
            currentBatch = tempArray.slice(0, i)
            tempArray = tempArray.slice(i)
            break;
        }
    }
    let startIndex = 0;
    let endIndex = 0;
    let blobSubmissionData = ''
    for (let i = 0; i < currentBatch.length; i++) {
        startIndex = endIndex
        blobSubmissionData = blobSubmissionData + currentBatch[i].blobData.slice(2)
        endIndex = blobSubmissionData.length
    }
    let formattedBlobSubmissionData:`0x${string}` = `0x${blobSubmissionData}`
    return {currentBatch, tempArray, formattedBlobSubmissionData}
}
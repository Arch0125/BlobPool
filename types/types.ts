import type { Address, Hash } from "viem";

export type blob = {
    blobId: number;
    sender: Address;
    signature: Hash;
    startIndex: number;
    endIndex: number;
    txHash: Hash;
    versionedHash: Hash;
    proposedfee: number;
}
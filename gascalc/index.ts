import { MIN_BASE_FEE_PER_BLOB_GAS, BLOB_BASE_FEE_UPDATE_FRACTION } from "../constants";
import { holeskyPubliClient } from "../utils/providers";

export async function getBlobBaseFee(){
    const latestBlock = await holeskyPubliClient.getBlock();
    const { excessBlobGas } = latestBlock;
    console.log(excessBlobGas)
    const blobBaseFeePerBlobGas = getBaseFeePerBlobGas(BigInt(excessBlobGas));
    const estimate = (blobBaseFeePerBlobGas * 110n) / 100n;
    return estimate;
}

const getBaseFeePerBlobGas = (excessBlobGas: bigint) => {
    return fakeExponential(
      MIN_BASE_FEE_PER_BLOB_GAS,
      excessBlobGas,
      BLOB_BASE_FEE_UPDATE_FRACTION,
    );
  };
  
  const fakeExponential = (
    factor: bigint,
    numerator: bigint,
    denominator: bigint,
  ) => {
    let i = 1n;
    let output = 0n;
    let numeratorAccum = factor * denominator;
    while (numeratorAccum > 0n) {
      output += numeratorAccum;
      numeratorAccum = (numeratorAccum * numerator) / (denominator * i);
      i += 1n;
    }
    return output / denominator;
  };
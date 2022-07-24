import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts/index';

let ONE = BigInt.fromI32(1);
let TEN = BigInt.fromI32(10);
let ZERO = BigInt.zero();
let ZERO_ADDRESS = Address.fromString(
  '0x0000000000000000000000000000000000000000'
);
let ZERO_BIGDEC = BigDecimal.fromString('0');

export { ONE, TEN, ZERO, ZERO_ADDRESS, ZERO_BIGDEC };

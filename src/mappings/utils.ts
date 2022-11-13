export const generateIdFromTwoElements = (param1: string, param2: string): string => {
  return param1 + '-' + param2
}

export const generateUniqueId = (transactionHash: string, logIndex: string): string => {
  return transactionHash + '-' + logIndex
}

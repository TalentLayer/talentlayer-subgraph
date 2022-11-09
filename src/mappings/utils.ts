export const generateProposalId = (serviceId: string, sellerId: string): string => {
  return serviceId + '-' + sellerId
}

export const generateUniqueId = (transactionHash: string, logIndex: string): string => {
  return transactionHash + '-' + logIndex
}

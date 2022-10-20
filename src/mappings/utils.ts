export const generateProposalId = (jobId: string, sellerId: string): string => {
    return jobId + '-' + sellerId;
}

export const generateUniqueId = (transactionHash: string, logIndex: string): string => {
    return transactionHash + '-' + logIndex;
}
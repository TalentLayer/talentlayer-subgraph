export const generateProposalId = (jobId: string, employeeId: string): string => {
    return jobId + '-' + employeeId;
}

export const generateUniqueId = (transactionHash: string, logIndex: string): string => {
    return transactionHash + "-" + logIndex;
}
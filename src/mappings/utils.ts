export const generateProposalId = (jobId: string, employeeId: string) => {
    return jobId + '-' + employeeId;
}
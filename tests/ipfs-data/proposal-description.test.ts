import { Address, BigInt, ipfs, json } from "@graphprotocol/graph-ts"
import { afterAll, assert, beforeAll, clearStore, describe, mockIpfsFile, newMockEvent, test } from "matchstick-as/assembly/index"
import { ZERO_ADDRESS } from "../../src/constants"
import { getOrCreateProposal } from "../../src/getters"
import { createProposalDescription } from "../../src/mappings/ipfs-data"
import { handleProposalCreated } from "../../src/mappings/service-registry"
import { generateIdFromTwoElements } from "../../src/mappings/utils"
import { createNewProposalCreatedEvent } from "./mock-events"

beforeAll(() => {
    //mock contract calls
})

const serviceId = new BigInt(1)
const sellerId = new BigInt(2)
// const rateToken = Address.fromBigInt(new BigInt(0)) //DOES NOT WORK
const rateToken = ZERO_ADDRESS //DOES NOT WORK
const rateAmount = new BigInt(10)
const cid_first = "QmenAPHSyKJzxgENdnqsURDbABSwGBzDVE2fXtCbwjvoNX" // Stored in ./ipfs-mock-files/
const cid_update = "QmTwRxkcCN8w13Yx66pSMq7Vw567XVBL2jdwZXPevoci2A" // Stored in ./ipfs-mock-files/

describe("handleProposalCreated()", () => {
  beforeAll(() => {
    const path = 'tests/ipfs-data/ipfs-mock-files/proposal-data'
    
    mockIpfsFile(cid_first, path + '/' + cid_first + '.json')
    mockIpfsFile(cid_update, path + '/' + cid_update + '.json')
    
    assert.entityCount('ProposalDescription', 0)
    assert.entityCount('Proposal', 0)

    //--- NOT YET WORKING

    let proposalCreatedEvent = createNewProposalCreatedEvent(
      serviceId,
      sellerId,
      rateToken, //Type issue
      rateAmount,
      cid_first
    )

    handleProposalCreated(proposalCreatedEvent)

    //------------------

    assert.entityCount('Proposal', 1)
    // assert.entityCount('ProposalDescription', 1)
  })
  
  afterAll(() => {
    clearStore()
  })
  
  test('ipfs.cat', () => {
    assert.entityCount('ProposalDescription', 0)
    
    let proposalData = ipfs.cat(cid_first)
    
    if(!proposalData){ return }
    
    const jsonObject = json.fromBytes(proposalData).toObject()
    
    let proposalId = generateIdFromTwoElements(serviceId.toString(), sellerId.toString())

    getOrCreateProposal(proposalId, serviceId)

    createProposalDescription(jsonObject, cid_first, proposalId)
  
    assert.entityCount('ProposalDescription', 1)
  })

  test('ProposalDescription Success Fields', () => {
    assert.fieldEquals('ProposalDescription', cid_first, 'description', 'First proposal')
  })
})
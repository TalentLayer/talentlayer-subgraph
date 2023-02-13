import { BigInt, ethereum, ipfs, json } from "@graphprotocol/graph-ts"
import { afterAll, assert, beforeAll, clearStore, describe, mockIpfsFile, test } from "matchstick-as/assembly/index"
import { getOrCreateService } from "../../src/getters"
import { createServiceDescription } from "../../src/mappings/ipfs-data"
import { handleServiceDataCreated } from "../../src/mappings/service-registry"
import { createNewServiceDataCreatedEvent } from "./mock-events"

beforeAll(() => {
    //mock contract calls
})

const serviceId = new BigInt(1)
const cid = "QmbViMcN9WiQhiFRuzMY3vVEJaG2yjD887zKFPVgYiogbw" // Stored in ./ipfs-mock-files/

describe("handleServiceCreated()", () => {
  beforeAll(() => {
    const path = 'tests/ipfs-data/ipfs-mock-files/service-data'
    
    mockIpfsFile(cid, path + '/' + cid + '.json')
    
    assert.entityCount('ServiceDescription', 0)
    assert.entityCount('Service', 0)

    let serviceDataCreatedEvent = createNewServiceDataCreatedEvent(
      serviceId,
      cid
    )

    handleServiceDataCreated(serviceDataCreatedEvent)

    assert.entityCount('Service', 1)
    // assert.entityCount('ServiceDescription', 1)
  })
  
  afterAll(() => {
    clearStore()
  })
  
  test('ipfs.cat', () => {
    assert.entityCount('ServiceDescription', 0)
    
    let serviceData = ipfs.cat(cid)
    
    if(!serviceData){ return }
    
    const jsonObject = json.fromBytes(serviceData).toObject()
    
    getOrCreateService(serviceId)
  
    createServiceDescription(jsonObject, cid, serviceId)
  
    assert.entityCount('ServiceDescription', 1)
  })

  test('ServiceDescription Success Fields', () => {
    assert.fieldEquals('ServiceDescription', cid, 'title', 'title')
    assert.fieldEquals('ServiceDescription', cid, 'about', 'about')
    assert.fieldEquals('ServiceDescription', cid, 'keywords_raw', 'keyword a, keyword b')
    assert.fieldEquals('ServiceDescription', cid, 'rateToken', '0x0000000000000000000000000000000000000000')
    assert.fieldEquals('ServiceDescription', cid, 'rateAmount', "1")
  })
})
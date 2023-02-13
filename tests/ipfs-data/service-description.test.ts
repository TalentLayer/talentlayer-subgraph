import { BigInt } from "@graphprotocol/graph-ts"
import { afterAll, assert, beforeAll, clearStore, describe, test } from "matchstick-as/assembly/index"
import { handleServiceDataCreated } from "../../src/mappings/service-registry"
import { createNewServiceDataCreatedEvent } from "./mock-events"


beforeAll(() => {
    //mock contract calls
})

const serviceId = new BigInt(1)
const cid = 'cid'

describe("handleServiceCreated()", () => {
  beforeAll(() => {
    let newCreateNewServiceDataCreatedEvent = createNewServiceDataCreatedEvent(
      serviceId,
      cid
    )
    handleServiceDataCreated(newCreateNewServiceDataCreatedEvent)
  })
  
  afterAll(() => {
    clearStore()
  })

  test("Should create a new Service entity", () => {
    assert.fieldEquals('Service', serviceId.toString(), 'cid', cid)
  })

  test("Shuold create a new ServiceDescription entity", () => {
    assert.fieldEquals('ServiceDescription', cid, 'service', serviceId.toString())
  })
})
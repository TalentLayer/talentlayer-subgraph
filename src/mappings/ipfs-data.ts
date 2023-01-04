import { log, ipfs, json, JSONValue, JSONValueKind, BigInt, TypedMap, Bytes, dataSource } from '@graphprotocol/graph-ts'
import { ServiceDescription, ProposalDescription, ReviewDescription, UserDescription, PlatformDescription } from '../../generated/schema'


//Adds metadata from ipfs as a entity called ServiceDescription.
//The description entity has the id of the cid to the file on IPFS
//Keywords are transformed so that they are only single worded and comma seperated.
//Keywords are currently stored in two versions, in their raw format as keywords_raw and in a transformed format called keywords.
export function handleServiceData(content: Bytes): void {
  const context = dataSource.context();
  const ipfsId = dataSource.stringParam()
  const jsonObject = json.fromBytes(content).toObject();  
  
  let description = new ServiceDescription(ipfsId)

  description.service = context.getString('id')
  description.createdAt = context.getBigInt('timestamp')

  description.keys = getKeys(jsonObject) //During dev

  description.title = getValueAsString(jsonObject, 'title')
  description.about = getValueAsString(jsonObject, 'about')
  description.role = getValueAsString(jsonObject, 'role')
  description.rateToken = getValueAsString(jsonObject, 'rateToken')
  description.rateAmount = getValueAsBigInt(jsonObject, 'rateAmount')
  description.keywords_raw = getValueAsString(jsonObject, 'keywords')
  description.keywords = transformIntoKeywordsList(description.keywords_raw!)
  
  description.save();
}

//Adds metadata from ipfs as a entity called ProposalDescription.
//The description entity has the id of the cid to the file on IPFS
export function handleProposalData(content: Bytes): void {
  const context = dataSource.context();
  const ipfsId = dataSource.stringParam()
  const jsonObject = json.fromBytes(content).toObject();  
  
  let description = new ProposalDescription(ipfsId)
  
  description.proposal = context.getString('id')
  description.createdAt = context.getBigInt('timestamp')

  description.keys = getKeys(jsonObject) //During dev

  description.expectedHours = getValueAsBigInt(jsonObject, 'expectedHours')
  description.proposalAbout = getValueAsString(jsonObject, 'proposalAbout')
  description.proposalTitle = getValueAsString(jsonObject, 'proposalTitle')
  description.rateType = getValueAsBigInt(jsonObject, 'rateType')
  description.description = getValueAsString(jsonObject, 'description')
  
  description.save()
}

//Adds metadata from ipfs as a entity called ReviewDescription.
//The description entity has the id of the cid to the file on IPFS
export function handleReviewData(content: Bytes): void {
  const context = dataSource.context();
  const ipfsId = dataSource.stringParam()
  const jsonObject = json.fromBytes(content).toObject();  
  
  let description = new ReviewDescription(ipfsId)

  description.review = context.getString('id')
  // description.createdAt = context.getBigInt('timestamp')

  description.keys = getKeys(jsonObject) //During dev

  description.content = getValueAsString(jsonObject, 'content')
  description.rating = getValueAsBigInt(jsonObject, 'rating')

  description.save()
}

//Adds metadata from ipfs as a entity called UserDescription.
//The description entity has the id of the cid to the file on IPFS
export function handleUserData(content: Bytes): void {
  const context = dataSource.context();
  const ipfsId = dataSource.stringParam()
  const jsonObject = json.fromBytes(content).toObject();  
  
  let description = new UserDescription(ipfsId)

  description.user = context.getString('id')
  description.createdAt = context.getBigInt('timestamp')

  description.keys = getKeys(jsonObject) //During dev

  description.about = getValueAsString(jsonObject, 'about')
  description.skills = getValueAsString(jsonObject, 'skills')
  description.title = getValueAsString(jsonObject, 'title')

  description.save()
}

//Adds metadata from ipfs as a entity called PlatformDescription.
//The description entity has the id of the cid to the file on IPFS
export function handlePlatformData(content: Bytes): void {
  const context = dataSource.context();
  const ipfsId = dataSource.stringParam()
  const jsonObject = json.fromBytes(content).toObject();  
  
  let description = new PlatformDescription(ipfsId)

  description.platform = context.getString('id')
  description.createdAt = context.getBigInt('timestamp')

  description.keys = getKeys(jsonObject) //During dev

  //Fill in with fields here, no fields currently exists

  description.save()
}


//==================================== Help functions ===========================================

function getValueAsString(jsonObject: TypedMap<string, JSONValue>, key: string): String | null {
  
  const value = jsonObject.get(key)
  
  if(value && value.kind == JSONValueKind.STRING) {
    return value.toString()
  }

  return null
}

function getValueAsBigInt(jsonObject: TypedMap<string, JSONValue>, key: string): BigInt | null {
  
  const value = jsonObject.get(key)

  if(value && value.kind == JSONValueKind.NUMBER) {
    return value.toBigInt()
  } 

  return null
}

function setupDescription<T>(description: T, parentId: String): T {
  if(parentId){
    var services = description.services
    if(services){
      services.push(serviceId)
    } else {
      services = [serviceId]
    }
    description.services = services
  } else {
    log.error("Requsted a serviceId, but none was given.", [])
    return
  }
}

//Transforms keywords into lowercase, semicolumn seperated keywords in an array.
//Example: "KeyWord1, KEYWORD 2" ==> ['keyword1', 'keyword', '2']
function transformIntoKeywordsList(keywords: String): Array<String> | null {  
      var _keywords = keywords.toLowerCase();
      _keywords = _keywords.replaceAll(", ", ",");
      _keywords = _keywords.replaceAll(" ", ",");
      return _keywords.split(","); 
}

/*Adds the information about which keys are present in the entry
This is done as a part of the PoC to show the current diversity of entries.
We currently have the following keys
expectedHours, proposalAbout, proposalTitle, rateType, description
..for that reason we can include all of them in the entity.
We need to make a decision on that.*/
function getKeys(jsonObject: TypedMap<string, JSONValue>): String {
  let s = ""
  for(let i = 0; i < jsonObject.entries.length; i++){
    if(i>0){ s += ", " }
    let key = jsonObject.entries[i].key
    s += key.toString();
  }
  return s
}
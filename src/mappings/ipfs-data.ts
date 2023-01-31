import { json, JSONValue, JSONValueKind, BigInt, TypedMap, Bytes, dataSource } from '@graphprotocol/graph-ts'
import {
  ServiceDescription,
  ProposalDescription,
  UserDescription,
  PlatformDescription,
  ReviewDescription,
} from '../../generated/schema'
import { getOrCreateKeyword } from '../getters'

//Adds metadata from ipfs as a entity called ServiceDescription.
export function handleServiceData(content: Bytes): void {
  const jsonObject = json.fromBytes(content).toObject()
  const cid = dataSource.stringParam()
  const context = dataSource.context()
  const serviceId = context.getBigInt('serviceId')

  let description = new ServiceDescription(cid)

  // Notice: Replaced with serviceId.toString()
  // Reason: Creates duplicate services.
  // Open issue https://github.com/graphprotocol/graph-node/issues/4087
  // description.service = getOrCreateService(serviceId).id

  // Notice: getOrCreateService must be called before.
  // Solution: getOrCreateService called in calling function.
  description.service = serviceId.toString()

  // Notice: Moved up to calling function
  // Reason: store.remove does not remove the entity from store when called from here.
  // if(context.isSet('oldCid')){
  //   const oldCid = context.getString('oldCid')
  //   if(oldCid){
  //     store.remove('ServiceDescription', oldCid)
  //   }
  // }

  // Non-mandatory (nullable) fields assigned below
  description.title = getValueAsString(jsonObject, 'title')
  description.about = getValueAsString(jsonObject, 'about')
  description.startDate = getValueAsBigInt(jsonObject, 'startDate')
  description.expectedEndDate = getValueAsBigInt(jsonObject, 'expectedEndDate')
  description.keywords_raw = getValueAsString(jsonObject, 'keywords')!.toLowerCase()
  description.rateToken = getValueAsString(jsonObject, 'rateToken')
  description.rateAmount = getValueAsBigInt(jsonObject, 'rateAmount')

  //Creates duplicate values. Open issue
  //https://github.com/graphprotocol/graph-node/issues/4087
  // description.keywords = createKeywordEntities(description.keywords_raw!)!

  description.save()
}

//Adds metadata from ipfs as a entity called ProposalDescription.
//The description entity has the id of the cid to the file on IPFS
export function handleProposalData(content: Bytes): void {
  return
  const jsonObject = json.fromBytes(content).toObject()
  const cid = dataSource.stringParam()
  const context = dataSource.context()
  const proposalId = context.getString('proposalId')

  if (!cid) {
    return
  }
  let description = new ProposalDescription(cid)

  // Notice: Replaced with proposalId.toString()
  // Reason: Creates duplicate proposals.
  // Open issue https://github.com/graphprotocol/graph-node/issues/4087
  // description.proposal = getOrCreateProposal(proposalId).id

  // Notice: getOrCreateProposal must be called before.
  // Solution: getOrCreateProposal called in calling function.
  description.proposal = proposalId.toString()

  // Notice: Moved up to calling function
  // Reason: store.remove does not remove the entity from store when called from here.
  // if(context.isSet('oldCid')){
  //   const oldCid = context.getString('oldCid')
  //   if(oldCid){
  //     store.remove('ProposalDescription', oldCid)
  //   }
  // }

  //Non-mandatory (nullable) fields assigned below
  description.startDate = getValueAsBigInt(jsonObject, 'startDate')
  description.title = getValueAsString(jsonObject, 'title')
  description.about = getValueAsString(jsonObject, 'about')
  description.expectedHours = getValueAsBigInt(jsonObject, 'expectedHours')

  description.save()
}

//Adds metadata from ipfs as a entity called ReviewDescription.
//The description entity has the id of the cid to the file on IPFS
//Does not need to remove reviews because they can not be updated.
export function handleReviewData(content: Bytes): void {
  const cid = dataSource.stringParam()
  const jsonObject = json.fromBytes(content).toObject()
  const context = dataSource.context()
  const reviewId = context.getString('reviewId')

  let description = new ReviewDescription(cid)

  // Notice: Replaced with reviewId
  // Reason: Creates duplicate reviews.
  // Open issue https://github.com/graphprotocol/graph-node/issues/4087
  // description.review = getOrCreateReview(reviewId).id

  // Notice: getOrCreateReview must be called before.
  // Solution: getOrCreateReview called in calling function.
  description.review = reviewId

  description.content = getValueAsString(jsonObject, 'content')

  description.save()
}

//Adds metadata from ipfs as a entity called UserDescription.
//The description entity has the id of the cid to the file on IPFS
export function handleUserData(content: Bytes): void {
  const jsonObject = json.fromBytes(content).toObject()
  const cid = dataSource.stringParam()
  const context = dataSource.context()
  const userId = context.getBigInt('userId')

  let description = new UserDescription(cid)

  // Notice: Replaced with userId.toString()
  // Reason: Creates duplicate users.
  // Open issue https://github.com/graphprotocol/graph-node/issues/4087
  // description.user = getOrCreateUser(userId).id

  // Notice: getOrCreateUser must be called before.
  // Solution: getOrCreateUser called in calling function.
  description.user = userId.toString()

  // Notice: Moved up to calling function
  // Reason: store.remove does not remove the entity from store when called from here.
  // if(context.isSet('oldCid')){
  //   const oldCid = context.getString('oldCid')
  //   if(oldCid){
  //     store.remove('UserDescription', oldCid)
  //   }
  // }

  //Non-mandatory (nullable) fields assigned below
  description.title = getValueAsString(jsonObject, 'title')
  description.about = getValueAsString(jsonObject, 'about')
  description.skills_raw = getValueAsString(jsonObject, 'skills')!.toLowerCase()
  description.timezone = getValueAsBigInt(jsonObject, 'timezone')
  description.headline = getValueAsString(jsonObject, 'headline')
  description.country = getValueAsString(jsonObject, 'country')
  description.picture = getValueAsString(jsonObject, 'picture')

  //Creates duplicate values. Open issue
  //https://github.com/graphprotocol/graph-node/issues/4087
  // description.skills = createKeywordEntities(description.skills_raw!)!

  description.save()
}

//Adds metadata from ipfs as a entity called PlatformDescription.
//The description entity has the id of the cid to the file on IPFS
export function handlePlatformData(content: Bytes): void {
  const jsonObject = json.fromBytes(content).toObject()
  const cid = dataSource.stringParam()
  const context = dataSource.context()
  const platformId = context.getBigInt('platformId')

  let description = new PlatformDescription(cid)

  // Notice: Replaced with platformId.toString()
  // Reason: Creates duplicate platforms.
  // Open issue https://github.com/graphprotocol/graph-node/issues/4087
  // description.platform = getOrCreatePlatform(platformId).id

  // Notice: getOrCreatePlatform must be called before.
  // Solution: getOrCreatePlatform called in calling function.
  description.platform = platformId.toString()

  // Notice: Moved up to calling function
  // Reason: store.remove does not remove the entity from store when called from here.
  // if(context.isSet('oldCid')){
  //   const oldCid = context.getString('oldCid')
  //   if(oldCid){
  //     store.remove('PlatformDescription', oldCid)
  //   }
  // }

  description.about = getValueAsString(jsonObject, 'about')
  description.website = getValueAsString(jsonObject, 'website')
  description.logo = getValueAsString(jsonObject, 'logo')

  description.save()
}

//==================================== Help functions ===========================================

function getValueAsString(jsonObject: TypedMap<string, JSONValue>, key: string): string | null {
  const value = jsonObject.get(key)

  if (value == null || value.isNull() || value.kind != JSONValueKind.STRING) {
    return null
  }

  return value.toString()
}

function getValueAsBigInt(jsonObject: TypedMap<string, JSONValue>, key: string): BigInt | null {
  const value = jsonObject.get(key)

  if (value == null || value.isNull() || value.kind != JSONValueKind.NUMBER) {
    return null
  }

  return value.toBigInt()
}

//Transforms a comma separated string of keywords into an Array of Keyword.id entities.
function createKeywordEntities(keywords: string): string[] | null {
  const _keywords = keywords.split(',')

  //To avoid returning an empty list, which is not allowed according to the schema.
  if (_keywords.length == 0) {
    return null
  }

  //Initialize an array with length of number of keywords
  let keywordArray: string[] = []

  //Create keyword entities and add to array
  for (let i = 0; i < _keywords.length; i++) {
    //removes whitespace at beginning and end.
    //needed because of keywords.split(",").
    let text = _keywords[i].trim()

    //Will generate duplicates.
    //Open subgraph issues
    //https://github.com/graphprotocol/graph-node/issues/4087
    let keyword = getOrCreateKeyword(text)

    keywordArray.push(keyword.id)
  }

  return keywordArray
}

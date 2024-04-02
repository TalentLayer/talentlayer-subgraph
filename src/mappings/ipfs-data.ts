import { json, JSONValue, JSONValueKind, BigInt, TypedMap, Bytes, dataSource, log } from '@graphprotocol/graph-ts'
import {
  ServiceDescription,
  ProposalDescription,
  UserDescription,
  PlatformDescription,
  ReviewDescription,
  UserWeb3mailPreferences,
  EvidenceDescription,
  Credential,
  CredentialDetail,
  Claim,
  ClaimsEncrypted,
} from '../../generated/schema'
import { getOrCreateKeyword } from '../getters'

//Adds metadata from ipfs as a entity called ServiceDescription.
export function handleServiceData(content: Bytes): void {
  const checkJson = json.try_fromBytes(content)
  const jsonObject = checkJson.isOk ? checkJson.value.toObject() : null

  if (jsonObject === null) {
    log.warning('Error parsing json: {}', [dataSource.stringParam()])
    return
  }

  const context = dataSource.context()
  const serviceId = context.getBigInt('serviceId')
  const id = context.getString('id')

  let description = new ServiceDescription(id)
  description.service = serviceId.toString()

  // Non-mandatory (nullable) fields assigned below
  description.title = getValueAsString(jsonObject, 'title')
  description.about = getValueAsString(jsonObject, 'about')
  description.startDate = getValueAsBigInt(jsonObject, 'startDate')
  description.expectedEndDate = getValueAsBigInt(jsonObject, 'expectedEndDate')
  const keywords = getValueAsString(jsonObject, 'keywords')
  if (keywords !== null) {
    description.keywords_raw = keywords.toLowerCase()
  }
  description.rateToken = getValueAsString(jsonObject, 'rateToken')
  description.rateAmount = getValueAsString(jsonObject, 'rateAmount')
  description.video_url = getValueAsString(jsonObject, 'video_url')

  //Creates duplicate values. Open issue
  //https://github.com/graphprotocol/graph-node/issues/4087
  // description.keywords = createKeywordEntities(description.keywords_raw!)!

  description.save()
}

//Adds metadata from ipfs as a entity called ProposalDescription.
//The description entity has the id of the cid to the file on IPFS
export function handleProposalData(content: Bytes): void {
  const checkJson = json.try_fromBytes(content)
  const jsonObject = checkJson.isOk ? checkJson.value.toObject() : null

  if (jsonObject === null) {
    log.warning('Error parsing json: {}', [dataSource.stringParam()])
    return
  }

  const context = dataSource.context()
  const proposalId = context.getString('proposalId')
  const id = context.getString('id')

  let description = new ProposalDescription(id)
  description.proposal = proposalId.toString()

  description.startDate = getValueAsBigInt(jsonObject, 'startDate')
  description.about = getValueAsString(jsonObject, 'about')
  description.expectedHours = getValueAsBigInt(jsonObject, 'expectedHours')
  description.video_url = getValueAsString(jsonObject, 'video_url')

  description.save()
}

//Adds metadata from ipfs as a entity called ReviewDescription.
//The description entity has the id of the cid to the file on IPFS
//Does not need to remove reviews because they can not be updated.
export function handleReviewData(content: Bytes): void {
  const checkJson = json.try_fromBytes(content)
  const jsonObject = checkJson.isOk ? checkJson.value.toObject() : null

  if (jsonObject === null) {
    log.warning('Error parsing json: {}', [dataSource.stringParam()])
    return
  }

  const context = dataSource.context()
  const reviewId = context.getString('reviewId')
  const id = context.getString('id')

  let description = new ReviewDescription(id)
  description.review = reviewId
  description.content = getValueAsString(jsonObject, 'content')

  description.save()
}

//Adds metadata from ipfs as a entity called UserDescription.
//The description entity has the id of the cid to the file on IPFS
export function handleUserData(content: Bytes): void {
  const checkJson = json.try_fromBytes(content)
  const jsonObject = checkJson.isOk ? checkJson.value.toObject() : null

  if (jsonObject === null) {
    log.warning('Error parsing json: {}', [dataSource.stringParam()])
    return
  }

  const context = dataSource.context()
  const userId = context.getBigInt('userId')
  const id = context.getString('id')

  let description = new UserDescription(id)
  description.user = userId.toString()

  description.title = getValueAsString(jsonObject, 'title')
  description.about = getValueAsString(jsonObject, 'about')
  const skills = getValueAsString(jsonObject, 'skills')
  if (skills !== null) {
    description.skills_raw = skills.toLowerCase()
  }
  description.timezone = getValueAsBigInt(jsonObject, 'timezone')
  description.headline = getValueAsString(jsonObject, 'headline')
  description.country = getValueAsString(jsonObject, 'country')
  description.role = getValueAsString(jsonObject, 'role')
  description.name = getValueAsString(jsonObject, 'name')
  description.video_url = getValueAsString(jsonObject, 'video_url')
  description.image_url = getValueAsString(jsonObject, 'image_url')

  const web3mailPreferencesObject = getValueAsObject(jsonObject, 'web3mailPreferences')
  if (web3mailPreferencesObject) {
    let web3mailPreferences = new UserWeb3mailPreferences(id)
    web3mailPreferences.activeOnNewService = getValueAsBoolean(web3mailPreferencesObject, 'activeOnNewService', false)
    web3mailPreferences.activeOnNewProposal = getValueAsBoolean(web3mailPreferencesObject, 'activeOnNewProposal', true)
    web3mailPreferences.activeOnProposalValidated = getValueAsBoolean(
      web3mailPreferencesObject,
      'activeOnProposalValidated',
      true,
    )
    web3mailPreferences.activeOnFundRelease = getValueAsBoolean(web3mailPreferencesObject, 'activeOnFundRelease', true)
    web3mailPreferences.activeOnReview = getValueAsBoolean(web3mailPreferencesObject, 'activeOnReview', true)
    web3mailPreferences.activeOnPlatformMarketing = getValueAsBoolean(
      web3mailPreferencesObject,
      'activeOnPlatformMarketing',
      false,
    )
    web3mailPreferences.activeOnProtocolMarketing = getValueAsBoolean(
      web3mailPreferencesObject,
      'activeOnProtocolMarketing',
      false,
    )
    web3mailPreferences.save()

    description.web3mailPreferences = id
  }

  const credentialsArray = getValueAsArray(jsonObject, 'credentials')
  if (credentialsArray) {
    for (let i = 0; i < credentialsArray.length; i++) {
      const credentialObj = credentialsArray[i].toObject()
      const credentialId = getValueAsString(credentialObj, 'id')

      if (credentialId !== null) {
        let credential = Credential.load(credentialId)
        if (credential == null) {
          credential = new Credential(credentialId)
        }
        // Fill Credential fields
        credential.issuer = getValueAsString(credentialObj, 'issuer')
        credential.signature1 = getValueAsString(credentialObj, 'signature1')
        credential.signature2 = getValueAsString(credentialObj, 'signature2')
        credential.userDescription = id

        // Handle CredentialDetail
        const credentialDetailObj = getValueAsObject(credentialObj, 'credential')
        if (credentialDetailObj) {
          const credentialDetailId = getValueAsString(credentialDetailObj, 'id')
          if (credentialDetailId !== null) {
            log.debug('credentialDetailId = {}', [credentialDetailId])
            let credentialDetail = CredentialDetail.load(credentialDetailId)
            if (credentialDetail == null) {
              credentialDetail = new CredentialDetail(credentialDetailId)
            }
            // Fill CredentialDetail fields
            credentialDetail.author = getValueAsString(credentialDetailObj, 'author')
            credentialDetail.platform = getValueAsString(credentialDetailObj, 'platform')
            credentialDetail.description = getValueAsString(credentialDetailObj, 'description')
            credentialDetail.issueTime = getValueAsString(credentialDetailObj, 'issueTime')
            credentialDetail.expiryTime = getValueAsString(credentialDetailObj, 'expiryTime')
            credentialDetail.userAddress = getValueAsString(credentialDetailObj, 'userAddress')

            // Handle Claims array within CredentialDetail
            const claimsArray = getValueAsArray(credentialDetailObj, 'claims')
            if (claimsArray) {
              for (let i = 0; i < claimsArray.length; i++) {
                const claimObj = claimsArray[i].toObject()
                const claimId = getValueAsString(claimObj, 'id')

                if (claimId !== null) {
                  log.debug('claimId = {}', [claimId])
                  let claim = Claim.load(claimId)
                  if (claim == null) {
                    claim = new Claim(claimId)
                  }
                  claim.platform = getValueAsString(claimObj, 'platform')
                  claim.criteria = getValueAsString(claimObj, 'criteria')
                  claim.condition = getValueAsString(claimObj, 'condition')
                  claim.value = getValueAsString(claimObj, 'value')
                  claim.credentialDetail = credentialDetailId

                  claim.save()
                }
              }
            }

            // Handle ClaimsEncrypted object within CredentialDetail
            const claimsEncryptedObj = getValueAsObject(credentialDetailObj, 'claimsEncrypted')
            if (claimsEncryptedObj) {
              const claimsEncryptedId = getValueAsString(claimsEncryptedObj, 'id')
              if (claimsEncryptedId !== null) {
                log.debug('claimsEncryptedId = {}', [claimsEncryptedId])
                let claimsEncrypted = ClaimsEncrypted.load(claimsEncryptedId)
                if (claimsEncrypted == null) {
                  claimsEncrypted = new ClaimsEncrypted(claimsEncryptedId)
                }
                claimsEncrypted.ciphertext = getValueAsString(claimsEncryptedObj, 'ciphertext')
                claimsEncrypted.dataToEncryptHash = getValueAsString(claimsEncryptedObj, 'dataToEncryptHash')
                claimsEncrypted.total = getValueAsBigInt(claimsEncryptedObj, 'total');
                claimsEncrypted.condition = getValueAsString(claimsEncryptedObj, 'condition')

                claimsEncrypted.save()
                credentialDetail.claimsEncrypted = claimsEncryptedId
              }
            }

            credentialDetail.save()
            credential.credentialDetail = credentialDetailId
          }
        }

        credential.save()
      }
    }
  }

  //Creates duplicate values. Open issue
  //https://github.com/graphprotocol/graph-node/issues/4087
  //description.skills = createKeywordEntities(description.skills_raw!)!

  description.save()
}

//Adds metadata from ipfs as a entity called PlatformDescription.
//The description entity has the id of the cid to the file on IPFS
export function handlePlatformData(content: Bytes): void {
  const checkJson = json.try_fromBytes(content)
  const jsonObject = checkJson.isOk ? checkJson.value.toObject() : null

  if (jsonObject === null) {
    log.warning('Error parsing json: {}', [dataSource.stringParam()])
    return
  }

  const context = dataSource.context()
  const platformId = context.getBigInt('platformId')
  const id = context.getString('id')

  let description = new PlatformDescription(id)

  description.platform = platformId.toString()
  description.about = getValueAsString(jsonObject, 'about')
  description.website = getValueAsString(jsonObject, 'website')
  description.video_url = getValueAsString(jsonObject, 'video_url')
  description.image_url = getValueAsString(jsonObject, 'image_url')

  description.save()
}

export function handleEvidenceData(content: Bytes): void {
  const checkJson = json.try_fromBytes(content)
  const jsonObject = checkJson.isOk ? checkJson.value.toObject() : null

  if (jsonObject === null) {
    log.warning('Error parsing json: {}', [dataSource.stringParam()])
    return
  }

  const context = dataSource.context()
  const evidenceId = context.getString('evidenceId')
  const id = context.getString('id')

  let description = new EvidenceDescription(id)
  description.evidence = evidenceId.toString()

  description.fileUri = getValueAsString(jsonObject, 'fileUri')
  description.fileHash = getValueAsString(jsonObject, 'fileHash')
  description.fileTypeExtension = getValueAsString(jsonObject, 'fileTypeExtension')
  description.name = getValueAsString(jsonObject, 'name')
  description.description = getValueAsString(jsonObject, 'description')

  description.save()
}

//==================================== Help functions ===========================================

function getValueAsObject(jsonObject: TypedMap<string, JSONValue>, key: string): TypedMap<string, JSONValue> | null {
  const value = jsonObject.get(key)

  if (value == null || value.isNull() || value.kind != JSONValueKind.OBJECT) {
    return null
  }

  return value.toObject()
}

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

function getValueAsBoolean(jsonObject: TypedMap<string, JSONValue>, key: string, defaulValue: boolean): boolean {
  const value = jsonObject.get(key)

  if (value == null || value.isNull() || value.kind != JSONValueKind.BOOL) {
    return defaulValue
  }

  return value.toBool()
}

function getValueAsArray(jsonObject: TypedMap<string, JSONValue>, key: string): JSONValue[] | null {
  const value = jsonObject.get(key)

  if (value == null || value.isNull() || value.kind != JSONValueKind.ARRAY) {
    return null
  }

  return value.toArray()
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
    // and error: error: store error: conflicting key value violates exclusion constraint "keyword_id_block_range_excl"
    // let keyword = getOrCreateKeyword(text)
    // keywordArray.push(keyword.id)
  }

  return keywordArray
}

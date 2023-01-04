import { log, ipfs, json, Bytes, dataSource } from '@graphprotocol/graph-ts'
import { ServiceDescription, ProposalDescription, ReviewDescription, UserDescription, PlatformDescription } from '../../generated/schema'

//Adds metadata from ipfs as a entity called Description.
//The description entity has the id of the cid to the file on IPFS
//Keywords are transformed so that they are only single worded and comma seperated.
//Keywords are currently stored in two versions, in their raw format as keywords_raw and in a transformed format called keywords.
export function handleServiceData(content: Bytes): void {
  let context = dataSource.context();
  let serviceId = context.getString("serviceId");
  let cid = dataSource.stringParam()
  let description = new ServiceDescription(cid)

  if(serviceId){
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
  
  const value = json.fromBytes(content).toObject();

  if(value){
    const title = value.get('title');
    const about = value.get('about');
    let keywords = value.get('keywords');
    const role = value.get('role');
    const rateToken = value.get('rateToken');
    const rateAmount = value.get('rateAmount');
    
    if(title){
      description.title = title.toString();
    } 

    if(about){
      description.about = about.toString();
    } 

    if(role){
      description.role = role.toString();
    }

    if(rateToken){
      description.rateToken = rateToken.toString();
    }

    if(rateAmount){
      // description.rateAmount = rateAmount.toBigInt();
    }

    if(keywords){
      //Transforms keywords into lowercase, semicolumn seperated keywords in an array.
      var _keywords = keywords.toString().toLowerCase();
      description.keywords_raw = _keywords;
      _keywords = _keywords.replaceAll(", ", ",");
      _keywords = _keywords.replaceAll(" ", ",");
      description.keywords = _keywords.split(","); 
    }
    description.save();
  }
}

export function handleProposalData(content: Bytes): void {
  let context = dataSource.context();
  let proposalId = context.getString('proposalId');
  let cid = dataSource.stringParam()
  let description = new ProposalDescription(cid)

  if(proposalId){
    var proposals = description.proposals
    if(proposals){
      proposals.push(proposalId)
    } else {
      proposals = [proposalId]
    }
    description.proposals = proposals
  } else {
    log.error("Requsted a proposalId, but none was given.", [])
    return
  }

  const jsonObject = json.fromBytes(content).toObject();

  if(jsonObject){
    
    //------- TO BE REMOVED: USED DURING DEV -------
    /*Adds the information about which keys are present in the entry
    This is done as a part of the PoC to show the current diversity of entries.
    We currently have the following keys
    expectedHours, proposalAbout, proposalTitle, rateType, description
    ..for that reason we can include all of them in the entity.
    We need to make a decision on that.*/
    let s = "["
    for(let i = 0; i < jsonObject.entries.length; i++){
      if(i>0){ s += ", " }
      let key = jsonObject.entries[i].key
      s += key.toString();
    }
    s += "]"
    description.keys = s
    //-----------------------------------------------
    
    //description.expectedHours
    let expectedHours = jsonObject.get('expectedHours')
    if(expectedHours){
      description.expectedHours = expectedHours.toBigInt();
    }
    //description.proposalAbout
    let proposalAbout = jsonObject.get('proposalAbout')
    if(proposalAbout){
      description.proposalAbout = proposalAbout.toString();
    }
    //description.proposalTitle
    let proposalTitle = jsonObject.get('proposalTitle')
    if(proposalTitle){
      description.proposalTitle = proposalTitle.toString();
    }
    //description.rateType
    let rateType = jsonObject.get('rateType')
    if(rateType){
      description.rateType = rateType.toBigInt();
    }
    //description.description
    let desc = jsonObject.get('description')
    if(desc){
      description.description = desc.toString();
    }
  }
  description.save()
}

export function handleReviewData(content: Bytes): void {
  let context = dataSource.context();
  let reviewId = context.getString('reviewId');
  let cid = dataSource.stringParam()
  let description = new ReviewDescription(cid)

  if(reviewId){
    var reviews = description.reviews
    if(reviews){
      reviews.push(reviewId)
    } else {
      reviews = [reviewId]
    }
    description.reviews = reviews
  } else {
    log.error("Requsted a reviewId, but none was given.", [])
    return
  }

  const jsonObject = json.fromBytes(content).toObject();

  if(jsonObject){
    
    //------- TO BE REMOVED: USED DURING DEV -------
    /*Adds the information about which keys are present in the entry
    This is done as a part of the PoC to show the current diversity of entries.
    We currently have the following keys
    expectedHours, proposalAbout, proposalTitle, rateType, description
    ..for that reason we can include all of them in the entity.
    We need to make a decision on that.*/
    let s = "["
    for(let i = 0; i < jsonObject.entries.length; i++){
      if(i>0){ s += ", " }
      let key = jsonObject.entries[i].key
      s += key.toString();
    }
    s += "]"
    description.keys = s
  }

  //description.content
  let contentData = jsonObject.get('content')
  if(contentData){
    description.content = contentData.toString();
  }
  //description.rating
  let rating = jsonObject.get('rating')
  if(rating){
    description.rating = rating.toBigInt();
  }

  description.save()
}

export function handleUserData(content: Bytes): void {
  let context = dataSource.context();
  let userId = context.getString('userId');
  let cid = dataSource.stringParam()
  let timestamp = context.getBigInt('timestamp')

  let description = UserDescription.load(cid)
  if(!description){
    description = new UserDescription(cid)
  }
  
  description.createdAt = timestamp

  if(userId){
    var users = description.users
    if(users) {
      users.push(userId)
    } else {
      users = [userId]
    }
    description.users = users
  } else {
    log.error("Requsted a userId, but none was given.", [])
    return
  }
  const jsonObject = json.fromBytes(content).toObject();

  if(jsonObject){
    //------- TO BE REMOVED: USED DURING DEV -------
    /*Adds the information about which keys are present in the entry
    This is done as a part of the PoC to show the current diversity of entries.
    We currently have the following keys
    expectedHours, proposalAbout, proposalTitle, rateType, description
    ..for that reason we can include all of them in the entity.
    We need to make a decision on that.*/
    let s = "["
    for(let i = 0; i < jsonObject.entries.length; i++){
      if(i>0){ s += ", " }
      let key = jsonObject.entries[i].key
      s += key.toString();
    }
    s += "]"
    description.keys = s
  }

  // description.about
  let about = jsonObject.get('about')
  if(about){
    description.about = about.toString();
  }
  
  //description.skills
  let skills = jsonObject.get('skills')
  if(skills){
    description.skills = skills.toString();
  }

  //description.title
  let title = jsonObject.get('title')
  if(title){
    description.title = title.toString();
  }

  description.save()
}

export function handlePlatformData(content: Bytes): void {
  let context = dataSource.context();
  let platformId = context.getString('platformId');
  let cid = dataSource.stringParam()
  let timestamp = context.getBigInt('timestamp')

  let description = PlatformDescription.load(cid)
  if(!description){
    description = new PlatformDescription(cid)
  }
  
  description.createdAt = timestamp

  if(platformId){
    var platforms = description.platforms
    if(platforms) {
      platforms.push(platformId)
    } else {
      platforms = [platformId]
    }
    description.platforms = platforms
  } else {
    log.error("Requsted a platformId, but none was given.", [])
    return
  }
  const jsonObject = json.fromBytes(content).toObject();

  if(jsonObject){
    //------- TO BE REMOVED: USED DURING DEV -------
    /*Adds the information about which keys are present in the entry
    This is done as a part of the PoC to show the current diversity of entries.
    We currently have the following keys
    expectedHours, proposalAbout, proposalTitle, rateType, description
    ..for that reason we can include all of them in the entity.
    We need to make a decision on that.*/
    let s = "["
    for(let i = 0; i < jsonObject.entries.length; i++){
      if(i>0){ s += ", " }
      let key = jsonObject.entries[i].key
      s += key.toString();
    }
    s += "]"
    description.keys = s
  }

  // description.about
  // let about = jsonObject.get('about')
  // if(about){
  //   description.about = about.toString();
  // }
  
  // //description.skills
  // let skills = jsonObject.get('skills')
  // if(skills){
  //   description.skills = skills.toString();
  // }

  // //description.title
  // let title = jsonObject.get('title')
  // if(title){
  //   description.title = title.toString();
  // }

  description.save()
}
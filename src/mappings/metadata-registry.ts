import { log, ipfs, json, Bytes, dataSource } from '@graphprotocol/graph-ts'
import { Service, Description } from '../../generated/schema'

export function handleMetadata(content: Bytes): void {
  let context = dataSource.context();
  let serviceId = context.getString("serviceId"); // this returns correct numbers

  let description = new Description(dataSource.stringParam())

  const value = json.fromBytes(content).toObject();

  if(value){
    log.info("========= VALUE IS TRUE", [])
    const title = value.get('title');
    const about = value.get('about');
    let keywords = value.get('keywords');
    const role = value.get('role');
    const rateToken = value.get('rateToken');
    const rateAmount = value.get('rateAmount');

    if(title && about && keywords && role && rateToken && rateAmount){
      description.title = title.toString();
      description.about = about.toString();
      description.role = role.toString();
      description.rateToken = rateToken.toString();
      description.rateAmount = rateAmount.toString();
      description.service = serviceId

      var _keywords = keywords.toString().toLowerCase();
      description.keywords_raw = _keywords;
      _keywords = _keywords.replaceAll(", ", ",");
      _keywords = _keywords.replaceAll(" ", ",");
      description.keywords = _keywords.split(",");
    }
    description.save();

  } else {
    log.info("========= VALUE IS FALSE", [])
  }
  
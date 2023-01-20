import { BigInt, log } from "@graphprotocol/graph-ts"
import { EpnsNotificationCounter, EpnsPushNotification } from '../../generated/schema'

// const SUB_GRAPH_ID = 'quent043/test'
const SUB_GRAPH_ID = 'talentlayer/talent-layer-protocol'

export function sendEPNSNotification(recipient: string, notification: string): void
{
  log.info('New id of EpnsNotificationCounter is: {}', [SUB_GRAPH_ID])

  let epnsNotificationCounter = EpnsNotificationCounter.load(SUB_GRAPH_ID)
  if (epnsNotificationCounter == null) {
    epnsNotificationCounter = new EpnsNotificationCounter(SUB_GRAPH_ID)
    epnsNotificationCounter.totalCount = BigInt.fromI32(0)
  }
  epnsNotificationCounter.totalCount = (epnsNotificationCounter.totalCount).plus(BigInt.fromI32(1))

  let count = epnsNotificationCounter.totalCount.toHexString()
  let id2 = `${SUB_GRAPH_ID}+${count}`
  log.info('New id of EpnsPushNotification is: {}', [id2])

  let epnsPushNotification = EpnsPushNotification.load(id2)
  if (epnsPushNotification == null) {
    epnsPushNotification = new EpnsPushNotification(id2)
  }

  epnsPushNotification.recipient = recipient
  epnsPushNotification.notification = notification
  epnsPushNotification.notificationNumber = epnsNotificationCounter.totalCount

  epnsPushNotification.save()
  epnsNotificationCounter.save()
}
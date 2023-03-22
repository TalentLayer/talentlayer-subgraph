export const generateIdFromTwoElements = (param1: string, param2: string): string => {
  return param1 + '-' + param2
}

export const generateUniqueId = (transactionHash: string, logIndex: string): string => {
  return transactionHash + '-' + logIndex
}

export const buildNotification = (_body: string, _title: string): string => {
  const //TODO check difference between title & subject | body & message ===> Not in the docs
    type = '3', // 1 is broadcast, 3 is targeted, 4 is subset
    title = `${_title}`,
    body = `${_body}`,
    subject = `${_title}`,
    message = `${_body}`,
    image = 'null',
    secret = 'null',
    cta = 'https://epns.io/'

  return `{\"type\": \"${type}\", \"title\": \"${title}\", \"body\": \"${body}\", \"subject\": \"${subject}\", \"message\": \"${message}\", \"image\": \"${image}\", \"secret\": \"${secret}\", \"cta\": \"${cta}\"}`
}

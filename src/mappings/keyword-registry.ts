import { log, store } from '@graphprotocol/graph-ts'
import { Keyword } from '../../generated/schema'
import {
  KeywordsAdded,
  KeywordsRemoved
} from '../../generated/KeywordRegistry/KeywordRegistry'

export function handleKeywordsAdded(event: KeywordsAdded): void {
	let keywords = event.params.keywords.split(',')
	
	for(let i = 0 ; i < keywords.length ; i++) {
		var keyword = Keyword.load(keywords[i])

		if(!keyword){
			keyword = new Keyword(keywords[i])
			keyword.save()
		}
	}

}

export function handleKeywordsRemoved(event: KeywordsRemoved): void {
	let keywords = event.params.keywords.split(',')

	for(let i = 0; i < keywords.length; i++){
		var keyword = Keyword.load(keywords[i])

		if(keyword){
			store.remove('Keyword', keyword.id.toString())
		}
	}
}
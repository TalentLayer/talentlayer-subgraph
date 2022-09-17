regenerate: 
	npm run codegen
	npm run build
	npm run remove-local
	npm run create-local
	npm run deploy-local

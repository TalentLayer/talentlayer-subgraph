regenerate: 
	npm run codegen
	graph build --network localhost
	npm run build
	npm run remove-local
	npm run create-local
	npm run deploy-local

sub:
	npm run remove-local
	npm run create-local
	npm run deploy-local

# To launch this command, you need first to auth with the graph-cli and the subgraph
deploy-goerli: 
	graph codegen
	graph build --network goerli
	graph deploy --node https://api.thegraph.com/deploy/ talentlayer/talent-layer-protocol
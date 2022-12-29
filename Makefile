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
# Goerli hosted subgraph: https://thegraph.com/hosted-service/subgraph/talentlayer/talent-layer-protocol
deploy-goerli: 
	graph codegen
	graph build --network goerli
	graph deploy --node https://api.thegraph.com/deploy/ talentlayer/talent-layer-protocol
deploy-goerli-test:
	graph codegen
	graph build --network goerli
	graph deploy --product hosted-service empaemanuel/talentlayer-goereli
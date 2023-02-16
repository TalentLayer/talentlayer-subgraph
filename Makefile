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
# Mumbai hosted subgraph: https://thegraph.com/hosted-service/subgraph/talentlayer/talent-layer-mumbai
deploy-mumbai: 
	graph codegen
	graph build --network mumbai
	graph deploy --product hosted-service talentlayer/talent-layer-mumbai
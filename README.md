# Subgraph for TalentLayer

https://api.thegraph.com/subgraphs/name/talentlayer/talent-layer-protocol

## Run all protocol on local

### Contract

- Create a local chain: `npx hardhat node`
- Deploy the contract: `npx hardhat deploy --use-pohmock --network localhost`
- Mint a talentLayerId: `npx hardhat run scripts/playground/mint-ID.ts --network localhost`

### TheGraph

- Update the json with new addresses and block 0: `update network.json`
- Build the config: `update subgraph.yaml: graph build --network xdai`
- Launch the docker `run-graph-node.sh`
- Deploy the new graph:
  - `npm run remove-local`
  - `npm run create-local`
  - `npm run deploy-local`

### Dapp

- Update .env with
  `REACT_APP_NETWORK_ID=1337`
  `REACT_APP_SUBGRAPH_URL='http://localhost:8000/subgraphs/name/talentlayer/talent-layer-protocol'`
- Update config/app.ts with new contract addresses
  `rpcUrl: http://127.0.0.1:8545/`

### GraphiQL request example

{
proposals{
id
status
uri
rateToken
rateAmount
job{
id,
employer{
handle
}
}

}
users(orderBy: id, orderDirection: desc) {
id
address
uri
handle
withPoh
}
jobs{
id
status
proposals{
id,
status,
rateAmount,
rateToken,
employee{
handle
}
}
}

}

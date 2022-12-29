# Subgraph for TalentLayer

- Local setup: https://docs.talentlayer.org/open-source-contribution/advanced-documentation/subgraph-local-setup
- Graph schema and endpoints by chain: https://docs.indie.talentlayer.org/developers/graph-schema

### GraphiQL request example

```graphql
{
  proposals {
    id
    createdAt
    updatedAt
    status
    uri
    rateToken {
      id
      name
      address
      decimals
    }
    rateAmount
    service {
      id
      buyer {
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
  services {
    id
    createdAt
    updatedAt
    status
    proposals {
      id
      status
      rateAmount
      rateToken {
        id
        name
      }
      seller {
        handle
      }
    }
  }
  payments {
    id
    rateToken {
      decimals
      id
      name
      address
    }
  }
}
```

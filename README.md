# Subgraph for TalentLayer

- Local setup: https://docs.talentlayer.org/open-source-contribution/advanced-documentation/subgraph-local-setup
- Endpoints: https://docs.talentlayer.org/technical-guides/graph-schema

# GraphQL Examples
```
{
  services(orderBy: id) {
    id
    created
    updated
    cid
    description {
      id
      title
      about
    }
  }
}
```
```
{
  proposals {
    id
    created
    updated
    description {
      id
      title
      about
    }
  }
}
```

# Testing
All tests can be run using `graph test`
You can also specify which test to run by specifying directory or file.
`graph test ipfs-data/service-description`
Please se the [graph documentation on unit testing](https://thegraph.com/docs/en/developing/unit-testing-framework/) for more details.
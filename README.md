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
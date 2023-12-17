# demo-hyper-express-graphql-server

Demo GraphQL server running on hyper-express

## requirements

* Node v20.x

## installation

This demo service uses:

* [@graphql-tools/schema](https://www.npmjs.com/package/@graphql-tools/schema) to prepare schema
* [dotenv](https://www.npmjs.com/package/dotenv)
* [graphql](https://www.npmjs.com/package/graphql) to execute commands
* [hyper-express](https://www.npmjs.com/package/hyper-express)
* [knex](https://www.npmjs.com/package/knex)
* [pg](https://www.npmjs.com/package/pg) (for PostgreSQL database)

```sh
npm i
```

## configuration

Refer to `.sample.env`, copy as `.env` and edit.

## build

```sh
npm run build
```

# start

```sh
# execute transpiled code in ./build
npm run start

# or execute TypeScript code in ./src
npm run start:ts
```

# usage

```sh
curl --location 'http://localhost:8080/'

curl --location 'http://localhost:8080/health'

# simple test feature to echo inputs
curl --location 'http://localhost:8080/test' \
--header 'Content-Type: application/json' \
--data '{
  "a": 123
}'

# simple 'health' feature to check db connection
curl --location 'http://localhost:8080/graphql' \
--header 'Content-Type: application/json' \
--data '{"query":"query {\n  health {\n    data\n    error\n  }\n}","variables":{}}'

# simple 'me' feature to get user details
curl --location 'http://localhost:8080/graphql' \
--header 'Content-Type: application/json' \
--data '{"query":"query {\n  me {\n    id\n    username\n  }\n}","variables":{}}'

curl --location 'http://localhost:8080/graphql' \
--header 'Content-Type: application/json' \
--data '{"query":"query me($inputs: LocationHistoryInput) {\n  me {\n    id\n    username\n    locationHistory(inputs: $inputs) {\n      data {\n        ts\n        latitude\n        longitude\n      }\n    }\n  }\n}","variables":{"inputs":{"after":"1701617081"}}}'
```

## schema

Refer to `schema.graphql`

## models

Refer to `./src/types.ts`

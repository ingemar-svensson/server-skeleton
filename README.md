## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn start:dev

# production mode (GCP requires this exact command)
$ yarn start
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Deploy to GCP

```bash
# 1. build
$ yarn build

# 2. deploy
$ cd dist
$ gcloud app deploy --appyaml=../devops/app.yaml
```



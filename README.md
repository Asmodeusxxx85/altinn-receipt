# Altinn Platform Receipt

## Build status
[![Receipt build status](https://dev.azure.com/brreg/altinn-studio/_apis/build/status/altinn-platform/receipt-master?label=platform/receipt)](https://dev.azure.com/brreg/altinn-studio/_build/latest?definitionId=58)

## Getting Started

These instructions will get you a copy of the receipt component up and running on your machine for development and testing purposes.

### Prerequisites

1. [.NET 6.0 SDK](https://dotnet.microsoft.com/download/dotnet/6.0)
2. Code editor of your choice
3. Newest [Git](https://git-scm.com/downloads)
4. [Docker CE](https://www.docker.com/get-docker)
5. Solution is cloned


#### Platform Receipt

The platform receipt component can run locally, both in docker and manually.

##### Start localtest and app

Receipt needs localtest for backend services. Start this as explained under app settings.
Also use an app for creating data that should be presented in receipt.

##### Manual

- Open a terminal in `src/backend`
- run `yarn --immutable`
- run `yarn run gulp-install-deps`
- run `yarn run gulp` (if running for the first time, otherwise this can be skipped)
- run `yarn run gulp-develop`

This will build and run receipt back end, and build and copy the receipt frontend to the `wwwroot` folder.
The application should now be available at `localhost:5060/receipt/{instanceOwnerId}/{instanceId}`
The script wil also listen to changes in the receipt react app, rebuild and copy the new react app to the `wwwroot` folder.

##### Docker

- Open a terminal in `src/backend`
- run `docker build .`
- The application should now be available at `localhost:5060/receipt/{instanceOwnerId}/{instanceId}`

# Altinn Platform Receipt

## Build status
[![Receipt build status](https://dev.azure.com/brreg/altinn-studio/_apis/build/status/altinn-platform/receipt-master?label=platform/receipt)](https://dev.azure.com/brreg/altinn-studio/_build/latest?definitionId=58)

## Getting Started

These instructions will get you a copy of the receipt component up and running on your machine for development and testing purposes.

### Prerequisites

1. [.NET 6.0 SDK](https://dotnet.microsoft.com/download/dotnet/6.0)
2. [Node LTS](https://nodejs.org/en/)
3. Code editor of your choice
4. Newest [Git](https://git-scm.com/downloads)
5. [Docker CE](https://www.docker.com/get-docker)
6. Solution is cloned

#### Platform Receipt

The platform receipt component can run locally, both in docker and manually.

##### Start localtest and app

Receipt needs localtest for backend services. Start this as explained under app settings.
Also use an app for creating data that should be presented in receipt.

##### Manual

- Open `src/backend/Views/Receipt/receipt.cshtml` and change the `link` and `script` tags according to the comments in that file.
- Open a terminal in `src/backend`
- Execute `dotnet run` and keep the process running

- Open another terminal in `src/frontend/receipt`
- Execute `yarn --immutable` (only required first time, or when dependencies in package.json changes)
- Execute `yarn start`

The application should now be available at `altinn3local.no/receipt/{instanceOwnerId}/{instanceId}`.
Making changes to the frontend code will automatically recompile and reload the browser with the updated changes.

##### Docker
[To be confirmend]
- Open a terminal in `src/backend/Altnn.Receipt`
- run `docker-compose up -d --build`

The application should now be available at `altinn3local.no/receipt/{instanceOwnerId}/{instanceId}`. If you make changes to the code, you will need to rerun `docker-compose up --build`.

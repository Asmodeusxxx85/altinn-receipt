# Altinn Platform Receipt

## Build status
[![Receipt build status](https://dev.azure.com/brreg/altinn-studio/_apis/build/status/altinn-platform/receipt-master?label=platform/receipt)](https://dev.azure.com/brreg/altinn-studio/_build/latest?definitionId=58)

## Getting Started

These instructions will get you a copy of the receipt component up and running on your machine for development and testing purposes.

### Prerequisites

1. [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
2. [Node LTS](https://nodejs.org/en/)
3. Code editor of your choice
4. Newest [Git](https://git-scm.com/downloads)
5. [Docker CE](https://www.docker.com/get-docker)
6. Solution is cloned

#### Running Platform Receipt Locally

The platform receipt component need to be run in **Docker**.

__Prerequisite__
1. This **Receipt** needs `app-localtest` for backend services. Before starting the `app-localtest` some modification woul dbe needed in the docker-compose.yml file to set a couple of environment variables.
2. Also an app from **Altinn Studio** is needed for creating data that should be presented in the **Receipt**. 

__Process__

1. **`app-localtest`**: Before starting `app-localtest` add these below lines to the `environment` section of `altinn_localtest` in the `docker-compose.yml` file of the **`app-localtest`**:
    ```
    - PlatformSettings__ApiAuthorizationEndpoint=http://host.docker.internal:5101/authorization/api/v1/
    - AuthnGeneralSettings__PlatformEndpoint=http://host.docker.internal:5101/
    ```
    After adding these the section `altinn_localtest` in the `docker-compose.yml` file of the **`app-localtest`** will look like this:
    ```
    altinn_localtest:
        container_name: localtest
        image: localtest:latest
        restart: always
        networks:
            - altinntestlocal_network
        ports:
            - "5101:5101"
        build:
        context: .
        environment:
            - DOTNET_ENVIRONMENT=Docker
            - ASPNETCORE_URLS=http://*:5101/
            - GeneralSettings__BaseUrl=http://${TEST_DOMAIN:-local.altinn.cloud}:${ALTINN3LOCAL_PORT:-80}
            - GeneralSettings__HostName=${TEST_DOMAIN:-local.altinn.cloud}
            - PlatformSettings__ApiAuthorizationEndpoint=http://host.docker.internal:5101/authorization/api/v1/
            - AuthnGeneralSettings__PlatformEndpoint=http://host.docker.internal:5101/
        volumes:
            - ./testdata:/testdata
            - ${ALTINN3LOCALSTORAGE_PATH:-AltinnPlatformLocal}:/AltinnPlatformLocal
        extra_hosts:
            - "host.docker.internal:host-gateway"
    ```

2. Start the app you have made in the **Altinn Studio** and run it. Check if this app is working fine with the `app-localtest` backend service.
3. Then go to the altinn-receipt directory and run `docker-compose up --build`. If you make changes to the code, you will need to re-run `docker-compose up --build` to see the change in action.
4. The application should now be available at `local.altinn.cloud/receipt/{instanceOwnerId}/{instanceId}`. You'll find the `{instanceOwnerId}` and `{instanceId}` in the URL after you successfully submitted the **Altinn Studio** app form.

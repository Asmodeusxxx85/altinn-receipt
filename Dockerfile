FROM node:16.17.0-alpine3.16 AS generate-receipt-app

WORKDIR /build

# Context is ., see docker-compose.yaml in src\Altinn.Platform\Altinn.Platform.Receipt\docker-compose.yml
COPY src/frontend/package.json .
COPY src/frontend/yarn.lock .
COPY src/frontend/.yarn/ ./.yarn/
COPY src/frontend/.yarnrc.yml .

# Copy shared and receipt code.
COPY src/frontend/shared/ ./shared/
COPY src/frontend/receipt/ ./receipt/

# Install
RUN corepack enable
RUN yarn --immutable

# Build runtime
RUN yarn workspace receipt-react-app run build; exit 0
CMD ["echo", "done"]



FROM mcr.microsoft.com/dotnet/sdk:6.0.401-alpine3.16 AS build

# Copy receipt backend
WORKDIR /Receipt/

COPY src/backend/Altinn.Receipt .

# Build and publish
RUN dotnet build Altinn.Platform.Receipt.csproj -c Release -o /app_output
RUN dotnet publish Altinn.Platform.Receipt.csproj -c Release -o /app_output

FROM mcr.microsoft.com/dotnet/aspnet:6.0.8-alpine3.16 AS final
EXPOSE 5060
WORKDIR /app
COPY --from=build /app_output .
COPY --from=generate-receipt-app /build/receipt/dist/receipt.js ./wwwroot/receipt/js/react/receipt.js
COPY --from=generate-receipt-app /build/receipt/dist/receipt.css ./wwwroot/receipt/css/receipt.css

# setup the user and group
# the user will have no password, using shell /bin/false and using the group dotnet
RUN addgroup -g 3000 dotnet && adduser -u 1000 -G dotnet -D -s /bin/false dotnet
# update permissions of files if neccessary before becoming dotnet user
USER dotnet
RUN mkdir /tmp/logtelemetry

ENTRYPOINT ["dotnet", "Altinn.Platform.Receipt.dll"]

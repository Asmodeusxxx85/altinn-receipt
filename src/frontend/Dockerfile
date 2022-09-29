# base image
FROM node:16.17.1-alpine3.16 AS generate-receipt-app

WORKDIR /build

# Context is ./src, see docker-compose.yaml in src\Altinn.Platform\Altinn.Platform.Receipt\docker-compose.yml
COPY ./frontend/package.json .
COPY ./frontend/yarn.lock .
COPY ./frontend/.yarn/ ./.yarn/
COPY ./frontend/.yarnrc.yml .

# Copy shared and receipt code.
COPY ./frontend/shared/ ./shared/
COPY ./frontend/receipt/ ./receipt/

# Install
RUN corepack enable
RUN yarn --immutable

# Build runtime
RUN yarn workspace receipt-react-app run build; exit 0
CMD ["echo", "done"]
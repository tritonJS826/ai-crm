FROM node:22.7.0-alpine AS build
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.8.0 --activate

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY pt-web/package.json pt-web/package.json

RUN pnpm install --filter pt-web --frozen-lockfile

COPY pt-web ./pt-web

RUN pnpm --filter pt-web build

FROM nginx:1.27-alpine AS runner

COPY --from=build /app/pt-web/build/ /usr/share/nginx/html/

COPY pt-web/nginx.conf /etc/nginx/conf.d/default.conf

#EXPOSE 5174
CMD ["nginx", "-g", "daemon off;"]

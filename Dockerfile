FROM node:22-alpine
WORKDIR /app


COPY . .

RUN npm config set strict-ssl false
RUN npm i -g pnpm

RUN pnpm install

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]

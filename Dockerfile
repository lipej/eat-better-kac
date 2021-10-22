FROM node:lts-alpine

WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
COPY prisma ./prisma/

RUN yarn install
COPY . .
RUN yarn build

EXPOSE 3000

CMD ["yarn", "start"]
FROM node:lts AS base

RUN npm config set cache /home/node/app/.npm-cache --global

WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
ENV PATH /app/node_modules/.bin:$PATH

RUN npm install
COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "prod"]
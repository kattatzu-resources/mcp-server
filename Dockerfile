FROM node:latest

COPY . .

RUN yarn
RUN yarn build

EXPOSE 3001

CMD ["yarn", "start"]
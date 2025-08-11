FROM node:20.11.1-alpine

WORKDIR /app


ENV VITE_BASE_URL=/api

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 4173

CMD ["npm", "run", "preview"]

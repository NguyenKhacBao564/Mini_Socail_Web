FROM node:18-alpine

WORKDIR /app

# Copy file package.json và cài đặt thư viện
COPY package*.json ./
RUN npm install --only=production

# Copy toàn bộ code nguồn
COPY . .

# Gateway chạy ở port 3000
EXPOSE 3000

CMD ["node", "src/server.js"]
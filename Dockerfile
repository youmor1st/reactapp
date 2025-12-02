# Используем Node.js 22
FROM node:22

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем весь проект
COPY . .

# Собираем проект
RUN npm run build

# Устанавливаем порт (если используешь другой, поменяй)
ENV PORT=3000
EXPOSE 3000

# Команда запуска
CMD ["npm", "start"]

# express-jwt-auth-api

Backend API на Node.js с JWT-аутентификацией, refresh-токенами, Redis и rate limiting.  
Проект демонстрирует production-подход к авторизации и защите API.

---

## Возможности

- Регистрация и авторизация пользователей
- Access / Refresh JWT токены
- Хранение refresh-токенов в Redis
- Middleware для защиты роутов
- Rate limiting (Redis)
- Prisma ORM
- Cookie-based авторизация (httpOnly)
- Простая HTML-страница для тестирования API

---

## Используемые технологии

- **Node.js**
- **Express**
- **Prisma ORM**
- **PostgreSQL**
- **Redis**
- **JWT (jsonwebtoken)**
- **bcrypt**
- **dotenv**

---


## Роуты API

### Пользователи

| Метод |     Роут      |         Описание         |   Middleware |
|------ |---------------|--------------------------|---------------
| POST  | `/regUser`    | Регистрация пользователя | rateLimit(reg, 3, 60)
| POST  | `/authUser`   | Авторизация              | rateLimit(auth, 5, 60)
| POST  | `/logoutUser` | Выход (удаление токена)  |
| POST  | `/refresh`    | Обновление access-токена | rateLimit(refresh, 10, 60)

---

### Посты (защищённые)

| Метод |   Роут   |           Middleware           |
|------ |----------|--------------------------------|
| GET   | `/posts` | authMiddleware                 |
| POST  | `/posts` | authMiddleware                 |
|       |          | rateLimit(create-post, 10, 60) |
---

## Middleware

### `authMiddleware`
- Проверяет accessToken из cookies
- Декодирует JWT
- Добавляет `req.user`

### `rateLimit`
- Принимает в себя keyPrefix, limit, windowSec
- Ограничивает количество запросов
- Использует Redis `INCR + EXPIRE`
- Работает по IP и типу роута









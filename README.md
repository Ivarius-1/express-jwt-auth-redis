# express-jwt-auth-redis

Backend API на Node.js с JWT-аутентификацией, refresh-токенами, Redis и rate limiting.

---

## Возможности

- Регистрация и авторизация пользователей
- Добавление и загрузки аватарки
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
- **multer**

---


## Роуты API

### Пользователи

| Метод |     Роут      |         Описание         |   Middleware |
|------ |---------------|--------------------------|---------------
| POST  | `/regUser`    | Регистрация пользователя | rateLimit(reg, 3, 60)
| POST  | `/authUser`   | Авторизация              | rateLimit(auth, 5, 60)
| POST  | `/logoutUser` | Выход (удаление токена)  |
| POST  | `/refresh`    | Обновление access-токена | rateLimit(refresh, 3, 60)
| POST  | `/avatar`     | Добавление изображения   | rateLimit(upload-avatar, 10, 60)
|       |               |                          | uploadAvatar

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

### `uploadAvatar`
- Создаёт папку в server/src/uploads/avatars/{req.user.id}
- Переименовывает файл в avatar
- Проверяет формат файла
- Устанавливает максимальный размер в 2мб









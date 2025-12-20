## Запуск и установка:

Клонируем ссылку репозитория:

- git clone <URL_репозитория>
- cd <папка проекта>

Создаём виртуальное окружение и активирует его:

- python -m venv venv
- source venv/bin/activate  # Linux / Mac
- venv\Scripts\activate     # Windows


Устанавливает зависимости:

- pip install -r requirements.txt
- cd frontend   
- npm install   


## Настраиваете PostgreSQL:

-sql
> CREATE DATABASE <имя бд> -создаем базу данных
-sql
> \l - проверяем, что бд создалась

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('POSTGRES_DB'),
        'USER': os.getenv('POSTGRES_USER'),
        'PASSWORD': os.getenv('POSTGRES_PASSWORD'),
        'HOST': os.getenv('POSTGRES_HOST'),
        'PORT': os.getenv('POSTGRES_PORT'),
    }
}


## Переменные окружения (.env):

- **DJANGO_SECRET_KEY** = `<Ваш секретный ключ>`
  - **Описание:**  
    Секретный ключ Django. Используется для:
    - шифрования cookies
    - CSRF-токенов

- **POSTGRES_DB** = `<имя БД>`
  - **Описание:**  
    Имя базы данных PostgreSQL.

- **POSTGRES_USER** = `<пользователь>`
  - **Описание:**  
    Пользователь PostgreSQL с доступом к базе.

- **POSTGRES_PASSWORD** = `<пароль>`
  - **Описание:**  
    Пароль пользователя PostgreSQL.

- **POSTGRES_HOST** = `<хост>`
  - **Описание:**  
    Хост базы данных.  
    `localhost` — при локальном запуске  
    имя сервиса — при использовании Docker

- **POSTGRES_PORT** = `<порт>`
  - **Описание:**  
    Порт PostgreSQL (по умолчанию `5432`).

- **REACT_APP_API_URL** = `http://localhost:5173`
  - **Описание:**  
    Базовый URL backend API, к которому обращается frontend.

- **DJANGO_DEBUG** = `<true / false>`
  - **Описание:**  
    Режим отладки Django.  
    `True` — для разработки  
    `False` — для продакшена

- **DJANGO_ALLOWED_HOSTS** = `localhost,127.0.0.1`
  - **Описание:**  
    Список разрешённых хостов (через запятую),  
    с которых можно обращаться к серверу.


## Настройка переменных окружения

Скопируйте файл '.env.example' и переименуйте его в '.env'

## Проверка подключения из Django

После настройки базы выполните миграции:

python manage.py makemigrations
python manage.py migrate


## Создание суперюзера, чтобы войти в админку:

python manage.py createsuperuser
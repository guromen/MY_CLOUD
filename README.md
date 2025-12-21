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

```
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

- **FRONTEND_URL** = `http://localhost:5173`
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
  
- **AUTH_COOKIE_HTTPONLY** = `<true / false>`
  - **Описание:**  
    Флаг HttpOnly для cookie авторизации.
    True — cookie недоступна из JavaScript (рекомендуется)
    False — доступна из JS (небезопасно)

- **AUTH_COOKIE_SECURE** = `<true / false>`
  - **Описание:** 
    Разрешает отправку cookie только по HTTPS.
    True — обязательно для продакшена
    False — допустимо для локальной разработки (HTTP)

- **AUTH_COOKIE_SAMESITE** = `Lax | Strict | None`
  - **Описание:** 
    Политика отправки cookie между сайтами:
    Lax — безопасный вариант по умолчанию
    Strict — максимальная защита (может ломать логин)
    None — разрешает кросс-сайт запросы (требует Secure=True)

- **AUTH_COOKIE_MAX_AGE** = `seconds`
  - **Описание:** 
    Время жизни cookie авторизации в секундах.

- **CSRF_COOKIE_SECURE_PROD** = `<true / false>`
  - **Описание:** 
    Передавать CSRF-cookie только по HTTPS.
    True — обязательно в продакшене
    False — допустимо в локальной разработке

- **CSRF_COOKIE_HTTPONLY_PROD** = `<true / false>`
  - **Описание:** 
    Делает CSRF-cookie недоступной из JavaScript.
    False — если CSRF-токен читается фронтом
    True — если CSRF обрабатывается полностью на backend

- **SESSION_COOKIE_SECURE_PROD** = `<true / false>`
  - **Описание:** 
    Ограничивает передачу session-cookie только по HTTPS.
    True — обязательно для продакшена
    False — допустимо для локальной разработки


## Настройка переменных окружения

Скопируйте файл '.env.example' и переименуйте его в '.env'

## Проверка подключения из Django

После настройки базы выполните миграции:

файлы миграций (0001_*.py - 0003_*.py) уже есть в репозитории, нужно лишь применить существующие
python manage.py migrate


## Создание суперюзера, чтобы войти в админку:

python manage.py createsuperuser

#Развертыванию на reg.ru
Аренда и подготовка сервера

1. Арендуйте VPS на **reg.ru**  
    Рекомендуемая ОС: **Ubuntu 20.04 / 22.04**
    
 Подключитесь к серверу по SSH:
    
  `ssh root@IP_СЕРВЕРА`

  `add user <name>` - создаем пользователя
  `usermod <name>` -aG sudo - назначаем админом
  `su <name>`- переключаемся на него
  `cd ~` - переходим в домашнюю директорию

 Обновите пакетный менеджер:    
`sudo apt upgrade`

2. Установка системных зависимостей(python, git должны быть установлены)
   `sudo install python3-venv python3-pip postgresql nginx`
   `sudo systemctl atart nginx` - запуск nginx
   `sudo systemctl status nginx` - проверка статуса (active(running))

3. Клонирование проекта
   `git clone <http-ссылка на проект>`
   `ls` -> `cd backend` корневая папка проекта с файлом settings.py>

4.  Настройка PostgreSQL
   `sudo su postgres` - переключаемся на юзер postgres
   `psql`
   `ALTER USER postgres WITH PASSWORD "your_pass" ;`
   `CREATE DATABASE <имя бд проекта>`
   `\q` -> `exit`

5.Переменные окружения (.env)
  Находимся в папке, содержащей manage.py:
  `nano .env` - создаем файл .env
  Настраиваем переменные окружения для продакшн, включая наш IP в ALLOWED_HOSTS, не забывая DEBUG=True
  
  `python3 -m venv env`
  `source env/bin/activate` - активируем окружение
  `pip install -r requirements.txt` - устанавливаем зависимости

6. Миграции
  `python3 namage.py migrate` - применяем миграции

7.Проверка запуска
  `python3 manage.py runserver 0.0.0.0:8000` , вставляем в браузере наш IP:8000 - должно работать

8. Systemd-сервис для Gunicorn
  `sudo nano /etc/systemd/system/gunicorn.service` - создаем файл gunicorn.service и делаем настройки:
    `[Unit] \
    Description=gunicorn \
    After=network.target \
    [Service] \
    User=<name>\
    Group=www-data \
    WorkingDirectory=/home/<name>/<bakcend> \
    ExecStart=/home/<name>/<backend>/env/bin/gunicorn \
    --access-logfile - --workers=3 --bind unix://home/<name>/backend/backend/project.cock \
    backend.wsgi:application \     
    [Install] WantedBy=multi-user.target`
    сохраняем, выходим \

  `sudo systemctl start gunicorn`
  `sudo systemctl enable gunicorn`
  `status gunicorn` - должен быть active(running) и в папке проекта появится project.sock\
  в settings.py STATIC-ROON=os.path.join(BASE.DIR, 'static')

9. Настройка Nginx
  Находимся в папке проекта:
  `sudo nano /etc/nginx/sites-available/my_project` - создаем файл my_project
    `server {  \
      listen 80; \
      server_name <your_domain.ru IP_СЕРВЕРА>; \
      location /static/ { \
        root /home/<name>/<backend>; \
      } 
      location / {  \
        include proxy_params;
        proxy_pass http://unix:/home/<name>/<backend>/<backend>/project.sock; \
      }\
    }`\
  `sudo ln -s /etc/nginx/sites-available/my_project /etc/nginx/sites-enabled`
  `sudo systemctl stop nginx`
  `sudo systemctl start nginx`
  `sudo systemctl status nginx` -> статус должен быть active(running)

Проверка:
`sudo ufw allow 'Nginx Full'` - права nginx
`.env/bin/activate`
`python manage.py collectstatic` - создает папку static


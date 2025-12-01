Запуск и установка:

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


Настраивает PostgreSQL:

создаём базу <имя БД> и пользователя (имена должны совпадать с settings.py)


Создаем переменные окружения .env:

DJANGO_SECRET_KEY = <Ваш секретный ключ>
POSTGRES_DB = <имя БД>
POSTGRES_USER = <пользователь>
POSTGRES_PASSWORD = <пароль>
POSTGRES_HOST = <хост>
POSTGRES_PORT = <порт>
REACT_APP_API_URL = <http://localhost:5173>


После настройки БД и переменных окружения:

python manage.py makemigrations
python manage.py migrate


Создание суперюзера

Чтобы войти в админку:

python manage.py createsuperuser
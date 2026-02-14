# MySQL setup

The API stores short URLs in MySQL. Follow these steps to install and configure it.

---

## 1. Install MySQL on Windows

**Option A – MySQL Installer (recommended)**

1. Download **MySQL Installer for Windows**:  
   https://dev.mysql.com/downloads/installer/
2. Run the installer and choose **Developer Default** or **Server only**.
3. Set a **root password** and finish the setup.
4. MySQL Server runs as a Windows service (port **3306** by default).

**Option B – Winget**

```powershell
winget install Oracle.MySQL
```

Then start the MySQL service and set the root password if prompted.

**Option C – Docker**

```powershell
docker run -d --name mysql-shortener -p 3306:3306 -e MYSQL_ROOT_PASSWORD=yourpassword -e MYSQL_DATABASE=shortener mysql:8
```

---

## 2. Create the database

If you didn’t use Docker with `MYSQL_DATABASE=shortener`, create the database:

**Command line (MySQL client):**
```sql
CREATE DATABASE shortener;
```

**Or** in MySQL Workbench / any client: create a new database named `shortener`.

---

## 3. Configure the app

1. Copy the example env file:
   ```powershell
   copy .env.example .env
   ```
2. Edit `.env` and set your MySQL credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=root
   DB_PASSWORD=your_password
   DB_DATABASE=shortener
   ```

---

## 4. Run the API

On first run, TypeORM will create the `short_urls` table (when `synchronize` is enabled in development):

```powershell
npm run start:dev
```

If the connection fails, check that MySQL is running and that `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, and `DB_DATABASE` in `.env` match your MySQL setup.

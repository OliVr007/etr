## 🚀 Telepítés és futtatás

### Előfeltételek

- Node.js
- MariaDB (MySQL) adatbázis
- npm

### 1. Repository klónozása

```bash
git clone git@github.com:OliVr007/etr.git
cd etr
```

### 2. Függőségek telepítése

```bash
npm install
```

> ⚠️ **Windows PowerShell esetén**, ha az npm parancsok nem működnek, futtasd a PowerShellt rendszergazdaként és add ki az alábbi parancsot:
>
> ```powershell
> Set-ExecutionPolicy unrestricted
> ```

### 3. Környezeti változók beállítása

Hozz létre egy `.env` fájlt a projekt gyökérkönyvtárában (lásd lentebb).

### 4. Adatbázis szinkronizálása

```bash
npx prisma db push
```

### 5. Szerver indítása

```bash
# Fejlesztői módban (automatikus újraindítással)
npm run dev

# Éles módban
node server.js
```

Az alkalmazás alapértelmezés szerint a **http://localhost:3000** címen érhető el.

---

## 🔐 Környezeti változók

Hozz létre egy `.env` fájlt a projekt gyökerében az alábbi tartalommal:

```env
DATABASE_URL=mysql://USER:PASSWORD@HOST:PORT/DATABASE
SESSION_SECRET=valami_titkos_kulcs
```

| Változó          | Leírás                                                        | Példa                                     |
| ---------------- | ------------------------------------------------------------- | ----------------------------------------- |
| `DATABASE_URL`   | MySQL kapcsolati string                                       | `mysql://root:pass@localhost:3306/etr_db` |
| `SESSION_SECRET` | Session titkosítási kulcs (32 karakter hosszúnak kell lennie) | `dba21fbdb11546a3b9e6eb902a74b50f`        |

---

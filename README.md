<div align="center">

# 📚 ETR — Elektronikus Tanulmányi Rendszer

**Egy modern, webalapú iskolai adminisztrációs és tanulmányi rendszer**

[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://prisma.io)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://mysql.com)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue?style=flat-square)](https://opensource.org/licenses/ISC)

</div>

---

## 🗂️ Tartalomjegyzék

- [A projektről](#-a-projektről)
- [Funkciók](#-funkciók)
- [Technológiai stack](#️-technológiai-stack)
- [Rendszerarchitektúra](#-rendszerarchitektúra)
- [Telepítés és futtatás](#-telepítés-és-futtatás)
- [Környezeti változók](#-környezeti-változók)
- [API végpontok](#-api-végpontok)
- [Szerzők](#-szerzők)

---

## 📖 A projektről

Az **ETR (Elektronikus Tanulmányi Rendszer)** egy szerepkör-alapú webalkalmazás, amely digitalizálja az iskolai adminisztrációs folyamatokat. A rendszer három különálló felületet biztosít — diákok, tanárok és adminisztrátorok számára — egységes bejelentkezési rendszeren keresztül.

A projekt célja egy modern, könnyen használható platform létrehozása, amely a papíralapú folyamatokat teljes mértékben kiváltja az oktatási környezetben.

---

## ✨ Funkciók

### 👨‍🎓 Diákok
- Jegyek és tanulmányi eredmények megtekintése
- Házi feladatok kezelése (leadás, törlés)
- Bejövő és elküldött üzenetek

### 👩‍🏫 Tanárok
- Jegyek rögzítése, szerkesztése és törlése osztályonként/tantárgyanként
- Házi feladatok létrehozása és beadások elfogadása
- Üzenetküldés diákok és más felhasználók felé

### 🛠️ Adminisztrátorok
- Felhasználókezelés (létrehozás, módosítás, törlés)
- Osztályok és tantárgyak kezelése
- Tanár-tantárgy hozzárendelések
- Teljes rendszerfelügyelet

---

## 🛠️ Technológiai stack

| Réteg | Technológia |
|---|---|
| **Runtime** | Node.js ≥ 18 |
| **Framework** | Express 5.x |
| **Templating** | EJS |
| **ORM** | Prisma 6.x |
| **Adatbázis** | MySQL 8.x |
| **Autentikáció** | iron-session + bcrypt |
| **Dev eszközök** | Nodemon |

---

## 🏗️ Rendszerarchitektúra

```
etr/
├── routes/
│   ├── admin/          # Admin CRUD végpontok (felhasználók, osztályok, tantárgyak)
│   ├── teacher/        # Tanári felület (jegyek, házi feladatok, üzenetek)
│   ├── api/            # REST API végpontok (diák + tanár)
│   └── auth/           # Bejelentkezés / kijelentkezés
├── views/              # EJS sablonok
├── public/             # Statikus fájlok (CSS, JS, képek)
├── prisma/
│   └── schema.prisma   # Adatbázis séma
├── server.js           # Belépési pont
└── .env                # Környezeti változók (nem verziókezelt)
```

### Adatmodell (főbb entitások)

```
users ──< student_classes >── classes
users ──< teacher_subjects >── subjects
users ──< grades
users ──< homework >── subjects
users ──< messages
users ──< absences
classes ──< timetable
```

---

## 🚀 Telepítés és futtatás

### Előfeltételek

- Node.js **≥ 18**
- MySQL adatbázis
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
PORT=3000
```

| Változó | Leírás | Példa |
|---|---|---|
| `DATABASE_URL` | MySQL kapcsolati string | `mysql://root:pass@localhost:3306/etr_db` |
| `SESSION_SECRET` | Session titkosítási kulcs | `my_super_secret_key` |
| `PORT` | Szerver portja (opcionális) | `3000` |

---

## 📡 API végpontok

### 🔑 Autentikáció
| Metódus | Végpont | Leírás |
|---|---|---|
| `GET` | `/login` | Bejelentkezési oldal |
| `POST` | `/api/login` | Bejelentkezés |
| `GET` | `/logout` | Kijelentkezés |

### 👨‍🎓 Diák API
| Metódus | Végpont | Leírás |
|---|---|---|
| `GET` | `/api/messages/received` | Bejövő üzenetek |
| `GET` | `/api/messages/sent` | Elküldött üzenetek |
| `POST` | `/api/messages/send` | Üzenet küldése |
| `PUT` | `/api/messages/:id/read` | Olvasottnak jelöl |
| `GET` | `/api/student/homeworks` | Házi feladatok |
| `PUT` | `/api/student/homework/submit/:id` | Házi feladat beadása |
| `DELETE` | `/api/student/homework/:id` | Házi feladat törlése |

### 👩‍🏫 Tanár API
| Metódus | Végpont | Leírás |
|---|---|---|
| `GET` | `/api/teacher/grading/:classId/:subjectId` | Jegyek lekérése |
| `POST` | `/api/teacher/grading/save` | Jegyek mentése |
| `PUT` | `/api/teacher/grading/:gradeId` | Jegy módosítása |
| `DELETE` | `/api/teacher/grading/:gradeId` | Jegy törlése |
| `POST` | `/api/teacher/homework` | Házi feladat létrehozása |
| `PUT` | `/api/teacher/homework/accept/:id` | Beadás elfogadása |

### 🛠️ Admin API
| Metódus | Végpont | Leírás |
|---|---|---|
| `POST/PUT/DELETE` | `/api/admin/users` | Felhasználókezelés |
| `POST/PUT/DELETE` | `/api/admin/classes` | Osztálykezelés |
| `POST/PUT/DELETE` | `/api/admin/subjects` | Tantárgykezelés |
| `POST/PUT/DELETE` | `/api/admin/teacher-subjects` | Hozzárendelések |

---

## 👥 Szerzők

<table>
  <tr>
    <td align="center">
      <b>Varga Olivér</b><br/>
      <a href="https://github.com/OliVr007">@OliVr007</a>
    </td>
    <td align="center">
    <b>Tóth Balázs</b><br/>
    <a href="https://github.com/s1mple06557">@s1mple06557</a>
    </td>
  </tr>
</table>

---

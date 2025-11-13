# 🚀 Ghid Complet de Setup - ExamCrafter

## 📋 Cuprins
1. [Pregătire Firebase](#1-pregătire-firebase)
2. [Configurare Variabile Environment](#2-configurare-variabile-environment)
3. [Firestore Security Rules](#3-firestore-security-rules)
4. [Crearea Primului Admin](#4-crearea-primului-admin)
5. [Import Întrebări](#5-import-întrebări)
6. [Rulare Aplicație](#6-rulare-aplicație)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Pregătire Firebase

### Pas 1.1: Creează Proiect Firebase
1. Accesează [Firebase Console](https://console.firebase.google.com)
2. Click pe "Add project" sau "Create a project"
3. Introdu numele proiectului (ex: "examcrafter")
4. (Opțional) Dezactivează Google Analytics dacă nu ai nevoie
5. Click "Create project"

### Pas 1.2: Activează Firebase Authentication
1. În Firebase Console, mergi la **Authentication** din meniul lateral
2. Click pe butonul **Get started**
3. În tab-ul **Sign-in method**, activează următoarele:

   **Email/Password:**
   - Click pe "Email/Password"
   - Toggle "Enable"
   - Click "Save"

   **Google Sign-In:**
   - Click pe "Google"
   - Toggle "Enable"
   - Selectează un email de support din dropdown
   - Click "Save"

### Pas 1.3: Creează Firestore Database
1. În Firebase Console, mergi la **Firestore Database**
2. Click pe **Create database**
3. Selectează **Production mode** (vom configura rules manual)
4. Alege o locație pentru database (ex: europe-west3 pentru Europa)
5. Click **Enable**

### Pas 1.4: Obține Configuration Keys
1. În Firebase Console, click pe ⚙️ (Settings) > **Project settings**
2. Scroll down la secțiunea "Your apps"
3. Click pe iconița **</>** (Web) pentru a adăuga o aplicație web
4. Introdu un nickname pentru app (ex: "ExamCrafter Web")
5. ✅ **NU** bifa "Also set up Firebase Hosting"
6. Click **Register app**
7. **Copiază** configuration object care arată astfel:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc..."
   };
   ```

---

## 2. Configurare Variabile Environment

### Pas 2.1: Creează fișierul .env
```bash
cp .env.example .env
```

### Pas 2.2: Completează valorile din Firebase Config
Deschide fișierul `.env` și completează cu valorile din pasul 1.4:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc...
```

**⚠️ IMPORTANT:**
- Nu pune `.env` în Git (este deja în `.gitignore`)
- Pentru production (Vercel, Netlify, etc.), setează aceste variabile în dashboard-ul platformei

---

## 3. Firestore Security Rules

### Pas 3.1: Configurează Reguli de Securitate
1. În Firebase Console, mergi la **Firestore Database** > **Rules**
2. Înlocuiește conținutul cu:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Users collection
    match /users/{userId} {
      // Anyone authenticated can read user documents
      allow read: if request.auth != null;

      // Users can only write to their own document
      allow write: if request.auth != null && request.auth.uid == userId;

      // Admins can write to any user document
      allow write: if isAdmin();
    }

    // Questions collection
    match /intrebari/{questionId} {
      // Anyone authenticated can read questions
      allow read: if request.auth != null;

      // Only admins can create, update, or delete questions
      allow create, update, delete: if isAdmin();
    }

    // Results collection
    match /results/{resultId} {
      // Users can only read their own results
      allow read: if request.auth != null &&
        resource.data.user_id == request.auth.uid;

      // Users can only create results for themselves
      allow create: if request.auth != null &&
        request.resource.data.user_id == request.auth.uid;

      // Admins can read all results
      allow read: if isAdmin();
    }
  }
}
```

3. Click **Publish**

### Pas 3.2: Creează Colecțiile (Opțional)
Firestore creează automat colecțiile când adaugi primul document, dar poți să le creezi manual:
1. În Firestore Database, click **Start collection**
2. Collection ID: `users`
3. Adaugă un document temporar (poate fi șters după)
4. Repetă pentru `intrebari` și `results`

---

## 4. Crearea Primului Admin

### Opțiunea A: Prin Aplicație (Recomandat)
1. **Rulează aplicația:**
   ```bash
   npm install
   npm run dev
   ```

2. **Înregistrează-te:**
   - Accesează `http://localhost:5173`
   - Click pe tab-ul "Înregistrare"
   - Completează formularul cu email și parolă
   - Click "Înregistrare"

3. **Setează rolul de admin:**
   - Mergi la Firebase Console > Firestore Database
   - Găsește colecția `users`
   - Caută documentul cu email-ul tău (ID-ul documentului = Firebase UID)
   - Click pe document
   - Click pe **Add field**:
     - Field: `role`
     - Type: `string`
     - Value: `admin`
   - Click **Update**

4. **Reconectează-te:**
   - Logout și login din nou în aplicație
   - Ar trebui să vezi butonul "Admin" în navbar

### Opțiunea B: Direct în Firestore
```javascript
// Structura documentului user
{
  email: "admin@example.com",
  displayName: "Admin User",
  role: "admin",  // ← Câmpul important
  photoURL: "",
  createdAt: "2025-01-15T10:00:00.000Z"
}
```

---

## 5. Import Întrebări

### Pas 5.1: Accesează Admin Dashboard
1. Autentifică-te cu contul admin
2. Click pe **Admin** în navbar
3. Vei vedea dashboard-ul admin

### Pas 5.2: Descarcă Template
În tab-ul "Import Întrebări", click pe unul din butoanele:
- **JSON** - pentru editare programatică
- **CSV** - pentru editare în Excel/Google Sheets
- **Excel** - pentru editare în Microsoft Excel

### Pas 5.3: Completează Întrebările

#### Format JSON:
```json
[
  {
    "intrebare": "Care este capitala României?",
    "varianta_a": "București",
    "varianta_b": "Iași",
    "varianta_c": "Cluj-Napoca",
    "raspuns_corect": "a"
  },
  {
    "intrebare": "Cât face 2 + 2?",
    "varianta_a": "3",
    "varianta_b": "4",
    "varianta_c": "5",
    "raspuns_corect": "b"
  }
]
```

#### Format CSV/Excel:
```
intrebare,varianta_a,varianta_b,varianta_c,raspuns_corect
Care este capitala României?,București,Iași,Cluj-Napoca,a
Cât face 2 + 2?,3,4,5,b
```

**Câmpuri obligatorii:**
- `intrebare` - textul întrebării
- `varianta_a` - prima opțiune
- `varianta_b` - a doua opțiune (opțional, poate fi gol)
- `varianta_c` - a treia opțiune (opțional, poate fi gol)
- `raspuns_corect` - răspunsul corect (`a`, `b`, sau `c`)

**Câmpuri opționale:**
- `categorie` - pentru filtrare pe categorii (ex: "MS ACCESS - Rezolvate")

### Pas 5.4: Importă Fișierul
1. Click pe butonul **Încarcă Fișier**
2. Selectează fișierul completat
3. Așteaptă confirmarea importului
4. Verifică în tab-ul "Gestionare Întrebări" că întrebările au fost importate

---

## 6. Rulare Aplicație

### Development
```bash
# Instalare dependențe
npm install

# Rulare development server
npm run dev

# Aplicația va fi disponibilă la:
# http://localhost:5173
```

### Production Build
```bash
# Build pentru producție
npm run build

# Preview build local
npm run preview

# Fișierele generate vor fi în folder-ul /dist
```

### Deploy Production

#### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Setează Environment Variables în Vercel Dashboard:
# Settings > Environment Variables > Add toate variabilele din .env
```

#### Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod

# Setează Environment Variables în Netlify Dashboard:
# Site settings > Environment variables
```

---

## 7. Troubleshooting

### ❌ "Firebase: Error (auth/configuration-not-found)"
**Cauză:** Environment variables nu sunt setate corect.
**Soluție:**
1. Verifică că `.env` există și conține toate variabilele
2. Restart dev server după modificarea `.env`
3. Verifică că folosești `VITE_` prefix pentru variabile

### ❌ "Missing or insufficient permissions"
**Cauză:** Firestore Security Rules nu sunt configurate corect.
**Soluție:**
1. Verifică că ai copiat exact rules din Pas 3.1
2. Verifică că utilizatorul are rol `admin` în Firestore
3. Logout și login din nou

### ❌ "Failed to get document because the client is offline"
**Cauză:** Probleme de conexiune sau configurație Firebase.
**Soluție:**
1. Verifică conexiunea la internet
2. Verifică că `projectId` din `.env` este corect
3. Verifică în Firebase Console că Firestore este activat

### ❌ Nu văd butonul "Admin" în navbar
**Cauză:** Utilizatorul nu are rol de admin.
**Soluție:**
1. Verifică în Firestore că documentul user are `role: "admin"`
2. Logout și login din nou
3. Clear browser cache

### ❌ Întrebările nu se încarcă în quiz
**Cauză:** Nu există întrebări în Firestore sau Security Rules blochează accesul.
**Soluție:**
1. Verifică în Firestore Database că există documente în colecția `intrebari`
2. Verifică Security Rules
3. Check console pentru erori

### ❌ Build-ul eșuează
**Cauză:** Dependențe lipsă sau erori de cod.
**Soluție:**
```bash
# Șterge node_modules și reinstalează
rm -rf node_modules package-lock.json
npm install

# Încearcă build din nou
npm run build
```

---

## 📞 Suport

Dacă întâmpini probleme:
1. Verifică console-ul browser-ului pentru erori (F12 > Console)
2. Verifică Firebase Console > Firestore > Rules pentru erori
3. Verifică că toate variabilele din `.env` sunt corecte
4. Creează un issue pe GitHub cu detalii despre eroare

---

## ✅ Checklist Final

- [ ] Proiect Firebase creat
- [ ] Authentication activat (Email/Password + Google)
- [ ] Firestore Database creat
- [ ] Firestore Security Rules configurate
- [ ] Environment variables setate în `.env`
- [ ] Aplicația rulează local (`npm run dev`)
- [ ] Utilizator admin creat
- [ ] Întrebări importate în Firestore
- [ ] Build de producție funcționează (`npm run build`)
- [ ] (Opțional) Aplicația deployată în production

**Felicitări! 🎉 ExamCrafter este gata de utilizare!**

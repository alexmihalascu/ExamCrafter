
# 🎓 ExamCrafter

![ExamCrafter](https://i.ibb.co/Q6FTZpD/image.png)

**ExamCrafter** is a modern quiz management application built with **React**, **Material UI**, **Firebase**, and **Firestore**. It offers users a complete experience for selecting, taking, and analyzing quizzes in an intuitive and accessible way.

## ✨ Key Features

![Demo Preview](https://i.ibb.co/Hxv53KL/image.png)

### 📝 1. Quiz Selection
- **Choose Your Challenge!** The ability to select between randomly generated questions (45 in total) or questions from specific categories.

### 📊 2. Quiz History
- **Track Your Progress** – each completed quiz is saved and can be reviewed to monitor long-term progress.

### 📈 3. Detailed Statistics
- **Accurate and Useful Data** – find out details about your performance, including success rates and average completion times.

### 📱 4. Progressive Web App (PWA)
- **Accessible Anytime, Anywhere** – as a PWA, ExamCrafter can be installed directly from the browser on mobile and desktop devices for enhanced accessibility.

### 🔐 5. Secure Authentication with Firebase
- **Protect Your Account** – ExamCrafter uses Firebase Authentication for a secure authentication system with support for:
  - Email/Password authentication
  - Google Sign-In
  - Password reset functionality

### 🗄️ 6. Firestore Database
- **Your Data is Safe** – the Firestore NoSQL database ensures fast, scalable storage and real-time access to all important information.

### ⚙️ 7. Account Customization
- **Configure Your Experience** – users can adjust account preferences, update profile information, and manage security settings.

### 👑 8. Admin Dashboard
- **Powerful Management Tools** – administrators have access to a dedicated dashboard with:
  - Question import functionality (JSON, CSV, Excel)
  - Question management and deletion
  - User statistics and platform analytics
  - Downloadable import templates

## 🌟 Benefits

- **💡 Modern Interface**: Material UI offers an attractive design and intuitive experience with dark mode support.
- **🔒 Security and Performance**: With Firebase and Firestore, data is kept secure, and the application operates swiftly with real-time updates.
- **🌐 24/7 Accessibility**: As a PWA, ExamCrafter is available anytime, anywhere, without needing a download from an app store.
- **🎯 Role-Based Access**: Built-in admin system for content management and platform oversight.

## 🚀 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- A Firebase project ([Create one here](https://console.firebase.google.com))

### Setup Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/alexmihalascu/ExamCrafter.git
   cd ExamCrafter
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Firebase**:

   a. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)

   b. Enable Authentication methods:
      - Go to Authentication > Sign-in method
      - Enable Email/Password
      - Enable Google Sign-In

   c. Create a Firestore database:
      - Go to Firestore Database
      - Create database in production mode
      - Set up security rules (see below)

   d. Get your Firebase configuration:
      - Go to Project Settings > General
      - Scroll to "Your apps" and click the web icon (</>)
      - Copy your configuration values

4. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

5. **Configure Firestore Security Rules**:

   In Firebase Console, go to Firestore Database > Rules and add:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users collection
       match /users/{userId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && request.auth.uid == userId;
       }

       // Questions collection (read-only for users, write for admins)
       match /intrebari/{questionId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null &&
           get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
       }

       // Results collection
       match /results/{resultId} {
         allow read: if request.auth != null && resource.data.user_id == request.auth.uid;
         allow create: if request.auth != null && request.resource.data.user_id == request.auth.uid;
       }
     }
   }
   ```

6. **Create an admin user**:

   After creating your first user account, go to Firestore Database and:
   - Find the `users` collection
   - Locate your user document (by email)
   - Add/modify the `role` field to `"admin"`

7. **Run the development server**:
   ```bash
   npm run dev
   ```

8. **Build for production**:
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
ExamCrafter/
├── src/
│   ├── components/       # Reusable UI components
│   ├── contexts/         # React Context (AuthContext)
│   ├── firebase/         # Firebase configuration
│   ├── pages/           # Application pages
│   │   ├── Admin.jsx    # Admin dashboard
│   │   ├── Main.jsx     # Home page
│   │   ├── Quiz.jsx     # Quiz interface
│   │   ├── History.jsx  # Quiz history
│   │   ├── User.jsx     # User profile
│   │   └── SignIn.jsx   # Authentication
│   └── theme.js         # Material UI theme configuration
└── public/              # Static assets
```

## 👨‍💼 Admin Features

### Accessing Admin Dashboard
1. Sign in with an admin account
2. Navigate to the Admin section in the navbar
3. Use the dashboard to:
   - Import questions from JSON, CSV, or Excel files
   - View platform statistics
   - Manage existing questions
   - Download import templates

### Question Import Format

All import files should contain the following fields:

**JSON Format:**
```json
[
  {
    "intrebare": "Question text?",
    "varianta_a": "Option A",
    "varianta_b": "Option B",
    "varianta_c": "Option C",
    "raspuns_corect": "a"
  }
]
```

**CSV/Excel Format:**
```
intrebare,varianta_a,varianta_b,varianta_c,raspuns_corect
Question text?,Option A,Option B,Option C,a
```

## 🌐 [Live Demo](https://github.com/alexmihalascu/ExamCrafter)

Visit the app's demo to see the features in action!

## 🛠️ Contributions

If you'd like to contribute to this project, feel free to fork the repository and submit a pull request. Feedback and improvements are always welcome!

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

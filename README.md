# TodoApp

A React Native task management application built with Expo Router and Firebase. This app allows users to efficiently manage their tasks with real-time syncing, filtering, sorting, and user authentication.

## Features

- User authentication with Firebase
- Real-time task syncing with Firestore database
- Add, edit, and delete tasks
- Filter tasks by priority (low, medium, high) and status (completed, incomplete)
- Sort tasks by due date, priority, or status
- Responsive and intuitive UI with a sidebar for profile and logout
- Toast notifications for user feedback
- Push notifications for task reminders

## Technologies Used

- React Native
- Expo Router
- Firebase Authentication & Firestore
- React Native Safe Area Context
- Sonner-native for toast notifications
- Expo Vector Icons
- React Native Community DateTimePicker
- TypeScript

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd todoApp/todoApp
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the Expo development server:

   ```bash
   npm start
   ```

4. Use the Expo Go app on your mobile device or an emulator to run the app.

## Usage

- Register or log in to your account.
- Add new tasks with title, description, due date, priority, and status.
- Edit or delete existing tasks.
- Use filters to view tasks by priority or completion status.
- Sort tasks by due date, priority, or status.
- Access the sidebar to view your profile or log out.

## Folder Structure

```
todoApp/
├── app/
│   ├── screens/           # Screen components (Home, Tasks, Profile, Register, etc.)
│   ├── home.tsx           # Main entry point exporting HomeScreen
│   ├── index.tsx          # App entry point
│   └── ...                # Other app-level components and screens
├── components/            # Reusable UI components (TaskCard, TaskForm, Header, FilterBar)
├── constants/             # Color and font constants
├── hooks/                 # Custom hooks (useColorScheme, useThemeColor)
├── assets/                # Images, icons, fonts
├── scripts/               # Utility scripts (e.g., updateTasksUserId.js)
├── android/               # Android native project files
├── app.json               # Expo configuration
├── package.json           # Project dependencies and scripts
└── README.md              # This file
```

## License

This project is licensed under the MIT License.

## Author

Ayush Shashi

---

## Design

The custom-made design for this app is available on Figma:  
[View the Figma Design](https://www.figma.com/design/cWcd36uJfLzMVJBWHu9Nf0/Untitled?node-id=0-1&t=u30VSCjLd5lqR56y-1)

Thank you for using TodoApp! Stay organized and productive.

# Voice Notes Web Application

A web application for taking notes using voice recognition. It uses the Web Speech API for voice-to-text conversion and stores notes in MongoDB Atlas.

## Features

- Voice-to-text note taking using your browser's built-in speech recognition
- Save, edit, and delete notes
- Responsive design for mobile and desktop
- Real-time speech-to-text preview

## Technologies Used

- **Frontend**: React.js, React Icons, CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Speech Recognition**: Web Speech API (browser native)

## Project Setup

### Prerequisites

- Node.js and npm installed
- MongoDB Atlas account

### Backend Setup

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the server directory and add:
   ```
   MONGODB_URI=your_mongodb_atlas_connection_string
   PORT=5000
   ```

4. Start the server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```
   cd client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the client directory and add:
   ```
   REACT_APP_API_URL=http://localhost:5000/api/notes
   ```

4. Start the React application:
   ```
   npm start
   ```

5. Open your browser and go to `http://localhost:3000`

## How to Use

1. Click the "Start Recording" button and start speaking
2. Your speech will be converted to text in real-time
3. Click "Stop Recording" when finished to save the note
4. You can edit or delete notes using the buttons in the note list

## Notes

- The Web Speech API is not supported in all browsers. It works best in Chrome, Edge, and Safari.
- You need an internet connection for the speech recognition to work properly.

## License

This project is licensed under the MIT License.

# YoutubeTranscript Processor

<img width="1009" height="490" alt="image" src="https://github.com/user-attachments/assets/2ee1f164-6ce9-4d5a-9c86-50836752c87f" />
<img width="1003" height="829" alt="image" src="https://github.com/user-attachments/assets/31be7c73-711f-44d4-b44e-e1ed1d5032b4" />



This project is a application that transcribes audio from YouTube videos and processes the transcript to extract key topics and insights. The backend is a Python FastAPI application, and the frontend is a modern JavaScript/TypeScript application built with React and Vite.

## Description

The goal of this project is to provide a user-friendly interface for transforming raw YouTube video transcripts into structured, readable information. The backend downloads the audio from a given YouTube URL, transcribes it using AssemblyAI, and then uses Google Gemini to process the raw transcript, extracting key topics and formatting the output. The frontend provides a simple interface for users to input a YouTube URL and view the formatted transcript.

## Features

### Backend
- **YouTube Audio Download:** Downloads audio from YouTube videos using `yt-dlp`.
- **Audio Transcription:** Transcribes the downloaded audio using AssemblyAI.
- **Transcript Processing:** Uses Google Gemini to extract key topics and format the transcript.
- **API Endpoint:** Exposes a FastAPI endpoint for the frontend to consume.

### Frontend
- **User Interface:** A simple and intuitive interface for inputting YouTube URLs.
- **Transcript Display:** Displays the formatted transcript returned by the backend.
- **Responsive Design:** The UI is responsive and works on different screen sizes.

## Technologies Used

### Backend
- Python
- FastAPI
- Uvicorn
- AssemblyAI
- Google Gemini
- yt-dlp
- python-dotenv
- requests
- pydantic

### Frontend
- TypeScript
- React
- Vite
- Node.js
- npm
- Tailwind CSS

## Project Structure

The project is organized into two main directories: `Backend/` for the FastAPI application and `frontend/` for the React/Vite application.

```
.
├── Backend/
│   ├── .env_example
│   ├── .gitignore
│   ├── Gemini_manager.py
│   ├── requirements.txt
│   ├── server.py
│   ├── transcript.py
│   └── trasnsform_transscript.py
├── frontend/
│   ├── .bolt/
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── src/
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
└── README.md
```

## Setup and Installation

### General
1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

### Backend Setup
1. Navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
   ```
3. Install the Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. This project uses `yt-dlp` to download YouTube audio. You can install it using `pip` as listed in `requirements.txt`.
5. Create a `.env` file in the `Backend` directory and add your API keys for AssemblyAI and Google Gemini:
   ```
   ASSEMBLYAI_API_KEY=your_assemblyai_api_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

### Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install the Node.js dependencies:
   ```bash
   npm install
   ```

## Usage

### Backend
1. Make sure you are in the `Backend` directory with the virtual environment activated.
2. Run the FastAPI application:
   ```bash
   uvicorn server:app --host 127.0.0.1 --port 9010 --reload
   ```

### Frontend
1. Make sure you are in the `frontend` directory.
2. Start the frontend development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to the URL provided by Vite (usually `http://localhost:5173`).

### User Flow
1. Run both the backend and frontend servers.
2. Open the frontend in your browser.
3. Enter a YouTube URL in the input field and click "Process Transcript".
4. The formatted transcript will be displayed on the screen.

### API Interaction
The frontend makes a `POST` request to the `/transcript` endpoint on the backend. The request body should be a JSON object with the `user_url` key:
```javascript
fetch('http://127.0.0.1:9010/transcript', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    user_url: 'your_youtube_url'
  })
});
```

## API Endpoints

### `/transcript`
- **Method:** `POST`
- **URL:** `/transcript`
- **Request Body:**
  ```json
  {
    "user_url": "string"
  }
  ```
- **Response:** An HTML response containing the formatted transcript.

## Error Handling

- **Backend:** The backend uses FastAPI's `HTTPException` to handle errors and return appropriate HTTP status codes and error messages.
- **Frontend:** The frontend displays an error message if the API request fails or returns an error.

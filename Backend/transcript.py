import subprocess
import requests
import time
import glob
from dotenv import load_dotenv
import os

class TranscriptClass:
    def __init__(self):
        load_dotenv(override=True)
        self.API_Key = os.environ.get("ASSEMBLYAI_API_KEY")
        self.BASE_URL = "https://api.assemblyai.com"
        self.HEADERS = {
            "authorization": self.API_Key
        }

    def download_audio_from_youtube(self, youtube_url, output_base="podcast"):
        # remove previous m4a file to add new one.
        file_path = "podcast.m4a"

        if os.path.exists(file_path):
            os.remove(file_path)
        
        yt_dlp_path = r"yt-dlp.exe"
        output_template = f"{output_base}.%(ext)s"

        command = [
            yt_dlp_path,
            "-f", "bestaudio[ext=m4a]",
            "-o", output_template,
            youtube_url
        ]

        subprocess.run(command, capture_output=True, check=True)
        downloaded_files = glob.glob(f"{output_base}.*")
        if not downloaded_files:
            raise FileNotFoundError("Audio file was not downloaded.")
        return downloaded_files[0]

    def upload_audio(self, file_path):
        with open(file_path, "rb") as f:
            response = requests.post(f"{self.BASE_URL}/v2/upload", headers=self.HEADERS, data=f)
            if response.status_code != 200:
                raise RuntimeError("Upload failed. Check file format, size, or API key.")
            return response.json()["upload_url"]

    def start_transcription(self, audio_url):
        config = {
            "audio_url": audio_url,
            "speech_model": "universal"
        }
        response = requests.post(f"{self.BASE_URL}/v2/transcript", json=config, headers=self.HEADERS)
        return response.json()["id"]

    def poll_transcription(self, transcript_id):
        polling_endpoint = f"{self.BASE_URL}/v2/transcript/{transcript_id}"
        while True:
            response = requests.get(polling_endpoint, headers=self.HEADERS).json()
            if response['status'] == 'completed':
                return response['text']
            elif response['status'] == 'error':
                raise RuntimeError(f"Transcription failed: {response['error']}")
            else:
                time.sleep(3)

    def transcribe_youtube_video(self, video_url):
        audio_file = self.download_audio_from_youtube(video_url)
        audio_url = self.upload_audio(audio_file)
        transcript_id = self.start_transcription(audio_url)
        transcript_text = self.poll_transcription(transcript_id)
        return transcript_text.splitlines()

from Gemini_manager import GeminiManager
from transcript import TranscriptClass

class Tranform:
    def __init__(self):
        self.gm = GeminiManager()
        self.tc = TranscriptClass()

    def get_system_prompt(self, metadata: str) -> str:
        return f"""
        You are a transcription formatter. Your task is to convert raw transcript metadata or dialogue into a structured, readable format.

        Input:
        <metadata-start>{metadata}<metadata-end>

        Instructions:

        1. **Extract Topics**: Identify distinct discussion points using exact words or headings from the metadata.
        2. **List Topics**: Present all identified topics under the heading **"Topics Discussed"**. Keep the phrasing exactly as in the input.
        3. **Group Content**: For each topic, group all related transcript lines beneath a heading matching that topic.
        4. **Clean Formatting**:
        - Remove timestamps and speaker labels.
        - Preserve original sentence order and text.
        5. **Output Structure**:

        ---

        ### Topics Discussed
        - [Topic 1]
        - [Topic 2] 
        ...

        ---

        ### [Topic 1]
        [Transcript lines relevant to Topic 1]

        ---

        ### [Topic 2]
        [Transcript lines relevant to Topic 2]

        ...

        ---

        This format is designed for further processing, analysis, summarization, or study.
        """

    def fetch_transform_data(self, user_url: str) -> str:
        transcript = self.tc.transcribe_youtube_video(user_url)
        system_prompt = self.get_system_prompt(transcript)
        assistant_reply = self.gm.get_answer(system_prompt)

        if not isinstance(assistant_reply, str):
            raise ValueError(f"Gemini response is not a string: {type(assistant_reply)}")

        return assistant_reply

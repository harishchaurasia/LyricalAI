from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from transformers import pipeline
import whisper
import os

app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load models (basic setup for now)
text_generator = pipeline("text-generation", model="gpt2")
speech_model = whisper.load_model("base")

@app.get("/")
def read_root():
    return {"message": "Lyrical AI backend is running"}

@app.post("/generate-lyrics")
async def generate_lyrics(prompt: str):
    # result = text_generator(prompt, max_length=100, num_return_sequences=1)
    result = text_generator(
    prompt,
    max_length=100,
    num_return_sequences=1,
    repetition_penalty=1.5,
    temperature=0.9,
    top_p=0.9,
    do_sample=True,
)

    return {"lyrics": result[0]["generated_text"]}

@app.post("/transcribe-audio")
async def transcribe_audio(file: UploadFile = File(...)):
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as f:
        f.write(await file.read())
    result = speech_model.transcribe(temp_path)
    os.remove(temp_path)
    return {"transcription": result["text"]}

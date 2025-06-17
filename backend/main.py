from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM
import whisper
import os
import torch

app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Force CPU usage for Whisper
torch.cuda.is_available = lambda: False

# Load models (basic setup for now)
# text_generator = pipeline("text-generation", model="gpt2")
# speech_model = whisper.load_model("base")

# --- Load Fine-Tuned GPT-2 Model ---
model_path = "C:/Users/haris/Desktop/LyricalAI/FineTuned-AI-Models/training/gpt2-lyrics-model/checkpoint-399837"
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForCausalLM.from_pretrained(model_path)
# print(model_path)
# print(model.config)
text_generator = pipeline("text-generation", model=model, tokenizer=tokenizer)

# --- Whisper Speech Model ---
speech_model = whisper.load_model("base")

@app.get("/")
def read_root():
    return {"message": "Lyrical AI backend is running"}

@app.post("/generate-lyrics")
async def generate_lyrics(prompt: str):
    # Add section markers to the prompt if not present
    if not any(marker in prompt.lower() for marker in ["[verse]", "[chorus]", "[bridge]"]):
        prompt = f"[Verse 1]\n{prompt}"
    
    result = text_generator(
        prompt,
        max_length=300,  # Increased for longer generations
        num_return_sequences=1,
        repetition_penalty=1.5,
        temperature=0.9,
        top_p=0.9,
        do_sample=True,
    )
    
    # Format the generated text
    generated_text = result[0]["generated_text"]
    
    # Replace section markers with proper formatting
    formatted_text = generated_text.replace("[Verse", "\n[Verse")
    formatted_text = formatted_text.replace("[Chorus", "\n[Chorus")
    formatted_text = formatted_text.replace("[Bridge", "\n[Bridge")
    
    # Add extra newline before each section
    formatted_text = formatted_text.replace("\n[", "\n\n[")
    
    # Clean up any double newlines
    formatted_text = "\n".join(line for line in formatted_text.split("\n") if line.strip())
    
    return {"lyrics": formatted_text}

@app.post("/transcribe-audio")
async def transcribe_audio(file: UploadFile = File(...)):
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as f:
        f.write(await file.read())
    result = speech_model.transcribe(temp_path)
    os.remove(temp_path)
    return {"transcription": result["text"]}

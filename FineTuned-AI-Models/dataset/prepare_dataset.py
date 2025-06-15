import pandas as pd
import os

# Load dataset
df = pd.read_csv("../lyrics.csv")

# Clean and filter
df = df.dropna(subset=["lyrics", "artist", "year", "genre"])
df = df[df["lyrics"].str.strip().astype(bool)]

# Format and write
os.makedirs("../dataset", exist_ok=True)
with open("../dataset/lyrics.txt", "w", encoding="utf-8") as f:
    for _, row in df.iterrows():
        artist = row['artist'].replace('-', ' ').title()
        year = str(row['year'])
        genre = row['genre'].title()
        lyrics = row['lyrics'].replace("\n", " ").strip()
        formatted = f"[Artist: {artist}] [Year: {year}] [Genre: {genre}]\n{lyrics}"
        f.write(formatted + "\n")

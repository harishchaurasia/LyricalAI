from datasets import Dataset
import os

data_path = "lyrics.txt"

with open(data_path, "r", encoding="utf-8") as f:
    lines = [line.strip() for line in f if line.strip()]

ds = Dataset.from_dict({"text": lines})
ds.save_to_disk("../training/lyrics_dataset")

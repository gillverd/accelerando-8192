"""Regenerate Unicode regression fixtures with tiktoken==0.14.0.

Run from any directory: python3 tests/generate-unicode-reference.py
Uses the shipped vocabulary; does not download a tokenizer.
"""
import base64
import json
from pathlib import Path

import tiktoken

root = Path(__file__).resolve().parent.parent
data = json.loads((root / "docs/data/alphabet.json").read_text())
encoding = tiktoken.Encoding(
    name="accelerando-8192-unicode-reference",
    pat_str=data["pattern"],
    mergeable_ranks={
        base64.b64decode(token[0]): rank
        for rank, token in enumerate(data["tokens"])
    },
    special_tokens={},
)
texts = [
    "a'ſ'se", "it'ſ'se", "hello'ſ'se", "a'ſ'Se", "a'ſ'ſe",
    "a's'se", "a'S'se", "a'T'RE'VE'M'LL'D", "a't're've'm'll'd",
    "क'ſ'sé", "a\u0085 b", "a\ufeff b",
]
fixture = {
    "generated_with": f"tiktoken {tiktoken.__version__}",
    "cases": [{"text": text, "ids": encoding.encode(text)} for text in texts],
}
(root / "tests/unicode-reference.json").write_text(
    json.dumps(fixture, ensure_ascii=True, indent=2) + "\n"
)

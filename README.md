# Accelerando-8192

**8,192 original glyphs. One reversible tokenizer.**

[Explore the live site](https://gillverd.github.io/accelerando-8192/)

An angular, mint-green alien alphabet paired with a custom 8,192-entry byte-pair tokenizer. The site includes a searchable character archive, a local browser encoder and decoder, an Accelerando specimen, and downloadable fonts, atlases, and reproducible tokenizer data.

## The system

- Exactly **8,192 unique glyph shapes**.
- Token ID equals glyph ID across the entire vocabulary.
- Custom tokenizer derived from the first 8,192 mergeable ranks of `o200k_base`, preserving its pretokenization pattern and all 256 byte values. This is not the full OpenAI tokenizer.
- No embeddings or model inference are required. 8,192 is a vocabulary size, not an embedding dimension.
- Glyph font uses private-use Unicode U+F0000–U+F1FFF.
- The Accelerando specimen has 34 lyric lines, 398 token occurrences, and 132 unique tokens, encoded independently per lyric line.

Rotations and reflections may be distinct glyphs. Geometric uniqueness is not a claim of equal human readability.

## Run locally

```sh
python3 -m http.server 8080 --directory docs
```

Open `http://localhost:8080`. The static site has no build step or backend, and input text never leaves the browser. No analytics or external scripts are loaded.

The transmission studio also decodes copied Accelerando-8192 glyphs. Whitespace between glyphs is ignored; spaces and line breaks in the message are recovered from their glyphs. Copy or download the recovered text.

## Verify

```sh
node tests/tokenizer.test.mjs
node tests/decoder.test.mjs
```

The browser tokenizer is compared with reference outputs from the Python tiktoken implementation, including the complete song and multilingual/whitespace cases. Decoder tests cover copied and wrapped streams, invalid glyphs and token IDs, UTF-8 byte fragments, and preservation of leading byte-order marks. The downloadable full package also includes the Python encoder and decoder.

## Publish

GitHub Pages serves the `docs/` directory on the `main` branch. All asset paths are relative so the site works under a project URL.

## Files

- `docs/index.html`, `style.css`, `app.mjs`: site and interactions.
- `docs/tokenizer.mjs`: browser BPE implementation.
- `docs/data/alphabet.json`: complete byte vocabulary, glyph geometry, and song token sequence.
- `docs/downloads/`: full project, four PNGs, vector atlas, tokenizer settings.
- `docs/assets/`: font, specimen images, and social artwork.

## Attribution

The alien glyph system was inspired by the lettering in the [Accelerando music video](https://www.youtube.com/watch?v=AVu5p2DMIf8), using a reference image supplied for this project. **Accelerando** is by **Grimes & Vadakin**; its supplied lyrics were transformed into the glyph specimen. Song material remains the property of its respective rights holders. The tokenizer vocabulary is derived from [OpenAI tiktoken](https://github.com/openai/tiktoken), which is MIT-licensed; its notice is included in `THIRD_PARTY_NOTICES.txt`. No ownership of the song is claimed.

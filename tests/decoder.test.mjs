import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {GlyphTokenizer} from '../docs/tokenizer.mjs';

const data=JSON.parse(await readFile(new URL('../docs/data/alphabet.json',import.meta.url),'utf8'));
const cases=JSON.parse(await readFile(new URL('reference.json',import.meta.url),'utf8'));
const tokenizer=new GlyphTokenizer(data);
const glyph=id=>String.fromCodePoint(0xF0000+id);

// Import independently generated reference IDs, rather than just this encoder's output.
for(const test of cases){
 const stream=test.ids.map(glyph).join('');
 assert.deepEqual(tokenizer.idsFromGlyphs(stream),test.ids);
 assert.equal(tokenizer.decode(tokenizer.idsFromGlyphs(stream)),test.text);
 const wrapped=test.ids.map(glyph).join(' \t\r\n\u00A0');
 assert.equal(tokenizer.decode(tokenizer.idsFromGlyphs(wrapped)),test.text);
}
assert.deepEqual(tokenizer.idsFromGlyphs(''),[]);
assert.deepEqual(tokenizer.idsFromGlyphs(' \t\r\n\u0085\u2028'),[]);
assert.equal(tokenizer.decode([]),'');
assert.deepEqual(tokenizer.idsFromGlyphs(glyph(0)+glyph(8191)),[0,8191]);
for(const code of [0xEFFFF,0xF2000,0x100000]){
 assert.throws(()=>tokenizer.idsFromGlyphs(String.fromCodePoint(code)),/Unsupported character/);
}
assert.throws(()=>tokenizer.idsFromGlyphs(glyph(0)+' A'),/U\+0041 at position 3/);
assert.throws(()=>tokenizer.idsFromGlyphs('\ud800'),/U\+D800 at position 1/);
assert.throws(()=>tokenizer.idsFromGlyphs('😀'),/U\+1F600 at position 1/);
for(const id of [-1,8192,0.5,NaN,Infinity,'0',undefined]){
 assert.throws(()=>tokenizer.decode([id]),/Invalid token ID/);
}
// Byte fragments are valid tokens but do not necessarily form valid UTF-8 alone.
const byteId=value=>tokenizer.bytes.findIndex(b=>b.length===1&&b[0]===value);
for(const bytes of [[0x80],[0xC3],[0xC3,0x28],[0xC0,0xAF],[0xED,0xA0,0x80]]){
 assert.throws(()=>tokenizer.decode(bytes.map(byteId)),/does not form valid UTF-8/);
}
assert.equal(tokenizer.decode([byteId(0xC3),byteId(0xA9)]),'é');
assert.equal(tokenizer.decode([byteId(0xEF),byteId(0xBF),byteId(0xBD)]),'\uFFFD');
assert.equal(tokenizer.decode([byteId(0)]),'\0');
// A leading BOM belongs to the source text and must not be silently stripped.
assert.equal(tokenizer.decode([byteId(0xEF),byteId(0xBB),byteId(0xBF),byteId(0x41)]),'\uFEFFA');
assert.equal(tokenizer.decode(tokenizer.encode('\uFEFFHello')),'\uFEFFHello');
// Whitespace bytes are recovered from glyphs, not from the pasted layout whitespace.
const whitespace=' \t\r\n';
assert.equal(tokenizer.decode(tokenizer.idsFromGlyphs(tokenizer.encode(whitespace).map(glyph).join('\n'))),whitespace);
console.log(`${cases.length} reference streams and wrapped streams passed; empty, range, ID and UTF-8 validation passed.`);

import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {GlyphTokenizer} from '../docs/tokenizer.mjs';
const data=JSON.parse(await readFile(new URL('../docs/data/alphabet.json',import.meta.url),'utf8'));
const cases=JSON.parse(await readFile(new URL('reference.json',import.meta.url),'utf8'));
const unicode=JSON.parse(await readFile(new URL('unicode-reference.json',import.meta.url),'utf8'));
const tokenizer=new GlyphTokenizer(data);
assert.equal(data.tokens.length,8192);assert.equal(data.shapes.length,8192);
for(const test of cases){const actual=tokenizer.encode(test.text);assert.deepEqual(actual,test.ids,`Token mismatch for ${JSON.stringify(test.text)}`);assert.equal(tokenizer.decode(actual),test.text);}
for(const test of unicode.cases){const actual=tokenizer.encode(test.text);assert.deepEqual(actual,test.ids,`Unicode token mismatch for ${JSON.stringify(test.text)}`);assert.equal(tokenizer.decode(actual),test.text);}
let count=0;for(const l of data.song.lines){if(l.kind==='lyrics'){assert.deepEqual(tokenizer.encode(l.text),l.token_ids);count+=l.token_ids.length;}}
assert.equal(count,398);
console.log(`${cases.length} reference cases, ${unicode.cases.length} Unicode cases and 34 lyric lines passed. 8192 entries; 398 song tokens.`);

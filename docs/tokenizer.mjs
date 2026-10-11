export class GlyphTokenizer {
 constructor(data){
  this.bytes=data.tokens.map(t=>Uint8Array.from(atob(t[0]),c=>c.charCodeAt(0)));
  this.ranks=new Map(this.bytes.map((b,i)=>[String.fromCharCode(...b),i]));
  const contraction="(?:'[sS]|'[tT]|'[rR][eE]|'[vV][eE]|'[mM]|'[lL][lL]|'[dD])";
  const pattern=data.pattern.replaceAll("(?i:'s|'t|'re|'ve|'m|'ll|'d)",contraction).replaceAll('\\s','\\p{White_Space}').replaceAll('\\S','\\P{White_Space}');
  this.pattern=new RegExp(pattern,'gu');this.encoder=new TextEncoder();this.decoder=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true});
 }
 encode(text){
  const ids=[];this.pattern.lastIndex=0;const pieces=[...text.matchAll(this.pattern)].map(x=>x[0]);
  if(pieces.join('')!==text)throw Error('Input could not be segmented without loss.');
  for(const piece of pieces){
   const bytes=String.fromCharCode(...this.encoder.encode(piece));
   if(this.ranks.has(bytes)){ids.push(this.ranks.get(bytes));continue;}
   const parts=[...bytes];
   while(parts.length>1){let rank=Infinity,index=-1;for(let i=0;i<parts.length-1;i++){const r=this.ranks.get(parts[i]+parts[i+1]);if(r!==undefined&&r<rank){rank=r;index=i;}}
    if(index<0)break;parts.splice(index,2,parts[index]+parts[index+1]);}
   ids.push(...parts.map(p=>this.ranks.get(p)));
  }
  return ids;
 }
 idsFromGlyphs(text){
  const ids=[];let position=0;
  for(const glyph of text){
   position++;
   // Layout whitespace is not a token: encoded whitespace has its own glyphs.
   if(/\p{White_Space}/u.test(glyph))continue;
   const code=glyph.codePointAt(0),id=code-0xF0000;
   if(id<0||id>=this.bytes.length)throw Error(`Unsupported character U+${code.toString(16).toUpperCase().padStart(4,'0')} at position ${position}. Paste Accelerando-8192 glyphs.`);
   ids.push(id);
  }
  return ids;
 }
 decode(ids){
  for(const id of ids)if(!Number.isInteger(id)||id<0||id>=this.bytes.length)throw Error(`Invalid token ID: ${id}.`);
  const b=ids.flatMap(id=>[...this.bytes[id]]);
  try{return this.decoder.decode(Uint8Array.from(b));}
  catch{throw Error('The glyph sequence does not form valid UTF-8 text. A byte-fragment glyph may be missing.');}
 }
}

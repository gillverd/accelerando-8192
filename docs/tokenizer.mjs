export class GlyphTokenizer {
 constructor(data){
  this.bytes=data.tokens.map(t=>Uint8Array.from(atob(t[0]),c=>c.charCodeAt(0)));
  this.ranks=new Map(this.bytes.map((b,i)=>[String.fromCharCode(...b),i]));
  // Unicode case-insensitive 's also matches the long s (U+017F), as in tiktoken.
  const contraction="(?:'[sSſ]|'[tT]|'[rR][eE]|'[vV][eE]|'[mM]|'[lL][lL]|'[dD])";
  const pattern=data.pattern.replaceAll("(?i:'s|'t|'re|'ve|'m|'ll|'d)",contraction).replaceAll('\\s','\\p{White_Space}').replaceAll('\\S','\\P{White_Space}');
  this.pattern=new RegExp(pattern,'gu');this.encoder=new TextEncoder();this.decoder=new TextDecoder('utf-8',{fatal:true});
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
 decode(ids){const b=ids.flatMap(id=>[...this.bytes[id]]);return this.decoder.decode(Uint8Array.from(b));}
}

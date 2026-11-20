const sets=[[[6.5,4.2,7.3,7.6,2.7],[3.8,6.2,5.5,6.0],[4.5,7.5,7.3,6.1,7.9,6.8]],[[3.4,4.2,3.4,4.6,4.0],[5.9,5.6,6.8,5.9],[7.7,7.8,8.3,8.2,8.3,8.3]]];
const colors=['#147065','#b34f2f','#687930'],names=['A','B','C'];
const by=id=>document.getElementById(id),mean=g=>g.reduce((a,b)=>a+b,0)/g.length;
const presets=[[.4,1.55],[2,.55]];
const residuals=sets[0].map(g=>{const m=mean(g),sd=Math.sqrt(g.reduce((a,v)=>a+(v-m)**2,0)/(g.length-1));return g.map(v=>(v-m)/sd)});
let scenario=0;
function render(){
 const separation=Number(by('sep').value), spread=Number(by('spread').value);
 const groups=residuals.map((g,j)=>g.map(r=>6+(j-16/15)*separation+r*spread));
 by('gapVal').textContent=separation.toFixed(2)+' min';by('spreadVal').textContent=spread.toFixed(2)+' min (SD)';
 const all=groups.flat(),overall=mean(all),means=groups.map(mean);
 const sse=groups.reduce((s,g,j)=>s+g.reduce((v,y)=>v+(y-means[j])**2,0),0);
 const within=sse/12;
 const sstr=means.reduce((s,v,j)=>s+groups[j].length*(v-overall)**2,0);
 const between=sstr/2;
 const entries=groups.flatMap((g,j)=>g.map((v,i)=>({j,i,v})));
 const f=between/within;
 // Exact F(2,12) right-tail probability.
 const prob=(1+f/6)**-6,reject=prob<.05;
 const pText=(prob<.001?prob.toExponential(2):prob.toPrecision(4));
 const decision=reject?'Reject H₀':'Do not reject H₀';
 by('f').textContent=f.toFixed(2);by('pv').textContent=pText;by('sstr').textContent=sstr.toFixed(2);
 by('sse').textContent=sse.toFixed(2);
 by('sst').textContent=(sstr+sse).toFixed(2);
 by('msb').textContent=between.toFixed(2);by('msw').textContent=within.toFixed(2);
 by('statStep').textContent='f* = MSTR / MSE ≈ '+between.toFixed(2)+' / '+within.toFixed(2)+' ≈ '+f.toFixed(2)+'. Numerator df = 3 − 1 = 2. Denominator df = 15 − 3 = 12.';
 by('pStep').textContent='P(F₂,₁₂ ≥ '+f.toFixed(2)+') ≈ '+pText+'. If all three population means were equal, this is the probability of an F statistic at least this large.';
 by('decStep').textContent='The p-value '+(reject?'is below':'is at or above')+' α = 0.05. '+decision+'.';
 by('conclusion').textContent=reject?'At the 5% level, these waits give evidence that at least two cafés differ in population mean wait time.':'At the 5% level, these waits give insufficient evidence that the cafés differ in population mean wait time.';
 [...by('cases').children].forEach((button,k)=>button.setAttribute('aria-pressed',scenario===k));
 const X=[100,235,370,522],Y=v=>303-v*22;
 const line=(x,y,u,w,attr)=>'<line x1="'+x+'" y1="'+y+'" x2="'+u+'" y2="'+w+'" '+attr+'/>';
 const label=(x,y,s,anchor='middle')=>'<text x="'+x+'" y="'+y+'" text-anchor="'+anchor+'" font-size="16" fill="#263f39">'+s+'</text>';
 let svg='<rect x="460" y="37" width="125" height="274" rx="9" fill="#f4f2e8"/>'+label(15,22,'Wait (minutes)','start');
 for(let y=0;y<=12;y+=2)svg+=line(48,Y(y),590,Y(y),'stroke="#d3dcd5"')+label(31,Y(y)+5,y);
 svg+=line(48,Y(overall),591,Y(overall),'stroke="#556e64" stroke-dasharray="6 5" stroke-width="1.7"');
 const offsets=[-16,12,-5,21,-22,4];
 for(const {v,i,j} of entries)for(const xx of [X[j]+offsets[i],X[3]+(j-1)*26+offsets[i]*.47])svg+='<circle cx="'+xx+'" cy="'+Y(v)+'" r="5.3" fill="'+colors[j]+'" stroke="white"><title>Café '+names[j]+', '+v.toFixed(2)+' minutes</title></circle>';
 means.forEach((m,j)=>{svg+=line(X[j]-29,Y(m),X[j]+27,Y(m),'stroke="#183931" stroke-width="3"')+label(X[j]+30,Y(m)-4,m.toFixed(1),'start')});
 X.forEach((x,j)=>svg+=label(x,339,j<3?'Café '+names[j]+' (n='+groups[j].length+')':'All 15'));
 document.querySelector('svg').innerHTML=svg;
}
[...by('cases').children].forEach((button,k)=>{
 button.onclick=()=>{
  scenario=k;
  by('sep').value=presets[k][0];
  by('spread').value=presets[k][1];
  render();
 };
});
render();
for(const id of ['sep','spread'])by(id).oninput=()=>{scenario=presets.findIndex(([a,b])=>a===+by('sep').value && b===+by('spread').value);render()};

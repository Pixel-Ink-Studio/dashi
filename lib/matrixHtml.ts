import type { TransitionMatrixData } from '@/types'

export function generateMatrixHtml(data: TransitionMatrixData): string {
  const json = JSON.stringify(data)

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${data.title}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#0f1117;--s1:#181e2d;--s2:#1f2740;--bd:#2a3148;--tx:#e2e8f0;--mt:#94a3b8;--dm:#475569;--gd:#f0b429;--gd2:#b8872a}
body{background:var(--bg);color:var(--tx);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;padding:28px 24px;min-height:100vh}
.brand{font-size:11px;color:var(--dm);text-transform:uppercase;letter-spacing:.08em;margin-bottom:5px}
h1{color:var(--gd);font-size:19px;font-weight:700;margin-bottom:3px}
.sub{color:var(--mt);font-size:12px;margin-bottom:20px}
.filters{display:flex;gap:18px;flex-wrap:wrap;padding:12px 16px;background:var(--s1);border:1px solid var(--bd);border-radius:10px;margin-bottom:20px;align-items:center}
.fg{display:flex;align-items:center;gap:7px;flex-wrap:wrap}
.fl{font-size:11px;color:var(--dm);white-space:nowrap}
.btn{padding:5px 12px;border-radius:6px;border:1px solid var(--bd);background:transparent;color:var(--mt);font-size:12px;cursor:pointer;transition:all .15s;white-space:nowrap}
.btn:hover{border-color:var(--gd2);color:var(--tx)}
.btn.on{background:var(--gd);border-color:var(--gd);color:#0f1117;font-weight:600}
.grid{display:grid;grid-template-columns:auto 1fr;gap:20px;align-items:start}
@media(max-width:860px){.grid{grid-template-columns:1fr}}
.tbl-wrap{overflow-x:auto;border:1px solid var(--bd);border-radius:10px}
table{border-collapse:collapse;font-size:12.5px}
thead tr{border-bottom:1px solid var(--bd)}
th{padding:8px 12px;text-align:center;font-weight:600;color:var(--gd);white-space:nowrap;background:var(--s2)}
th.cr{text-align:right;color:var(--dm);font-weight:400;border-right:1px solid var(--bd);min-width:100px;font-size:11px}
.sl{display:block;font-size:10px;color:var(--dm);font-weight:400;margin-top:2px}
td{padding:8px 12px;text-align:center;border:1px solid rgba(42,49,72,.4);font-variant-numeric:tabular-nums;transition:background .2s}
td.rl{text-align:right;border-right:1px solid var(--bd);background:var(--s2);white-space:nowrap}
.sn{color:var(--gd);font-weight:600;font-size:12px}
td.tot{border-left:1px solid var(--bd);color:var(--dm);font-size:11px;background:var(--s2)}
tr:hover td:not(.rl):not(.tot){filter:brightness(1.14)}
.chart-panel{background:var(--s1);border:1px solid var(--bd);border-radius:10px;padding:16px}
.ct{font-size:12px;font-weight:600;color:var(--tx);margin-bottom:14px}
.ct span{color:var(--gd)}
.toggles{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}
.tg{padding:3px 9px;border-radius:5px;border:1px solid;background:transparent;font-size:11px;cursor:pointer;transition:opacity .15s;opacity:.4;font-weight:500}
.tg.on{opacity:1}
.legend{display:flex;gap:14px;flex-wrap:wrap;margin-top:10px}
.li{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--mt)}
.ld{width:10px;height:10px;border-radius:3px;flex-shrink:0}
.kpi-row{display:flex;flex-wrap:wrap;gap:12px;margin-top:20px}
.kpi{background:var(--s1);border:1px solid var(--bd);border-radius:10px;padding:12px 16px;flex:1;min-width:145px}
.kl{font-size:11px;color:var(--mt);margin-bottom:4px}
.kv{font-size:20px;font-weight:700;color:var(--gd);font-variant-numeric:tabular-nums}
.ks{font-size:10px;color:var(--dm);margin-top:2px}
.footer{margin-top:20px;font-size:11px;color:var(--dm);border-top:1px solid var(--bd);padding-top:12px;line-height:1.6}
</style>
</head>
<body>
<div class="brand">Grupo Financiero ACME · Dashi-DeLorean</div>
<h1 id="ttl"></h1>
<p class="sub" id="sub"></p>
<div class="filters">
  <div class="fg"><span class="fl">Año:</span><div id="yr-btns" style="display:flex;gap:6px;flex-wrap:wrap"></div></div>
  <div class="fg"><span class="fl">Métrica:</span><div id="mt-btns" style="display:flex;gap:6px"></div></div>
</div>
<div class="grid">
  <div>
    <div class="tbl-wrap"><table id="mtx"></table></div>
    <div class="legend" style="margin-top:10px">
      <div class="li"><div class="ld" style="background:rgba(100,149,237,.65)"></div>Sin cambio</div>
      <div class="li"><div class="ld" style="background:rgba(34,197,94,.65)"></div>Recuperación</div>
      <div class="li"><div class="ld" style="background:rgba(239,68,68,.65)"></div>Deterioro</div>
    </div>
  </div>
  <div class="chart-panel">
    <div class="ct">Evolución por año — <span id="ml"></span></div>
    <div id="ch"></div>
    <p id="proj-note" style="font-size:10px;color:var(--dm);margin-top:5px"></p>
    <div class="toggles" id="togs"></div>
  </div>
</div>
<div class="kpi-row" id="kpis"></div>
<div class="footer">Matriz calculada mediante self-join mes a mes en sabana_tdc_riesgos. Cada celda (i→j) = % de tarjetas que pasaron de cubeta i a cubeta j entre meses consecutivos. Proyección 2025 calculada por regresión lineal sobre datos históricos disponibles.</div>
<script>
const D=${json};
const SL={0:'Al corriente',1:'1–30 días',2:'31–60 días',3:'61–90 días',4:'91–120 días',5:'121+ días'};
const MET={pct:{l:'Porcentaje',f:v=>v>0?v.toFixed(1)+'%':'—'},count:{l:'N° tarjetas',f:v=>v>0?v.toLocaleString('es-MX'):'—'},saldo:{l:'Saldo MXN',f:v=>v>0?'$'+(v/1e6).toFixed(2)+'M':'—'}};
const COLORS=['#f0b429','#ef4444','#22c55e','#3b82f6','#a855f7','#f97316','#14b8a6','#e879f9','#84cc16','#fb7185','#64c5ef','#fbbf24'];
const HAS_YR=!!(D.cellsByYear&&D.cellsByYear.length);
const ALL_YRS=HAS_YR?[...new Set(D.cellsByYear.map(c=>c.year))].sort((a,b)=>a-b):[];
const HAS_25=ALL_YRS.includes(2025);
const CHART_YRS=HAS_25?ALL_YRS:[...ALL_YRS,...(ALL_YRS.length?[2025]:[])];
const HIST_YRS=ALL_YRS.filter(y=>y<2025);

// Assign stable colors to transition keys
const COLOR_MAP={};
(function(){const ks=[...new Set(D.cells.filter(c=>c.count>0).map(c=>c.fromState+'-'+c.toState))];ks.forEach((k,i)=>{COLOR_MAP[k]=COLORS[i%COLORS.length];})})();

let AY='all';   // active year
let AM='pct';   // active metric
const SEL=new Set(['0-0','0-1','1-0','1-2']);

// ── helpers ──────────────────────────────────────────────────────────────────

function cells(yr){
  if(yr==='all'||!HAS_YR)return D.cells;
  return D.cellsByYear.filter(c=>c.year===yr);
}
function lkp(arr){const m=new Map();for(const c of arr)m.set(c.fromState+'-'+c.toState,c);return m;}
function gv(c,m){if(!c)return 0;return Number(c[m])||0;}
function yrVal(f,t,yr,m){if(!HAS_YR)return null;const c=D.cellsByYear.find(x=>x.year===yr&&x.fromState===f&&x.toState===t);return c?gv(c,m):null;}

function proj25(f,t,m){
  if(!HAS_YR)return null;
  const pts=HIST_YRS.map(y=>{const v=yrVal(f,t,y,m);return v!=null?[y,v]:null;}).filter(Boolean);
  if(pts.length<2)return pts.length===1?pts[0][1]:null;
  const n=pts.length,sx=pts.reduce((s,p)=>s+p[0],0),sy=pts.reduce((s,p)=>s+p[1],0);
  const sxy=pts.reduce((s,p)=>s+p[0]*p[1],0),sx2=pts.reduce((s,p)=>s+p[0]*p[0],0);
  const d=n*sx2-sx*sx;if(!d)return sy/n;
  const sl=(n*sxy-sx*sy)/d,ic=(sy-sl*sx)/n;
  return Math.max(0,sl*2025+ic);
}

function bg(f,t,v,mx){
  if(!v||!mx)return'transparent';
  const i=Math.min(v/mx,1);
  if(f===t)return\`rgba(100,149,237,\${.1+i*.75})\`;
  if(t>f) return\`rgba(239,68,68,\${.08+i*.78})\`;
  return\`rgba(34,197,94,\${.08+i*.78})\`;
}
function tc(v,mx){return(v/mx)>.48?'#fff':'';}

// ── matrix ────────────────────────────────────────────────────────────────────

function renderMtx(){
  const cs=cells(AY),lk=lkp(cs),met=MET[AM],st=D.states;
  const mx=Math.max(...cs.map(c=>gv(c,AM)),1);
  let h='<thead><tr><th class="cr">De ↓ / A →</th>';
  for(const s of st)h+=\`<th>Cub. \${s}<span class="sl">\${SL[s]}</span></th>\`;
  h+='<th>n</th></tr></thead><tbody>';
  for(const fs of st){
    h+=\`<tr><td class="rl"><span class="sn">Cub. \${fs}</span><span class="sl">\${SL[fs]}</span></td>\`;
    for(const ts of st){
      const c=lk.get(fs+'-'+ts),v=c?gv(c,AM):0;
      const b=bg(fs,ts,v,mx),t=v&&b!=='transparent'?tc(v,mx):'';
      h+=\`<td style="background:\${b}\${t?';color:'+t:''}">\${met.f(v)}</td>\`;
    }
    const rn=cs.filter(c=>c.fromState===fs).reduce((s,c)=>s+c.count,0);
    h+=\`<td class="tot">\${rn>0?rn.toLocaleString('es-MX'):'—'}</td></tr>\`;
  }
  document.getElementById('mtx').innerHTML=h+'</tbody>';
}

// ── chart (SVG) ───────────────────────────────────────────────────────────────

function renderChart(){
  const wrap=document.getElementById('ch');
  document.getElementById('ml').textContent=MET[AM].l;
  if(!HAS_YR||ALL_YRS.length===0){
    wrap.innerHTML='<p style="color:#475569;font-size:12px;padding:16px 0">Sin datos históricos por año disponibles.</p>';
    return;
  }

  const W=520,H=230,mg={t:14,r:14,b:36,l:56},cW=W-mg.l-mg.r,cH=H-mg.t-mg.b;
  const xmn=CHART_YRS[0],xmx=CHART_YRS.at(-1);
  function xp(y){return(y-xmn)/(xmx-xmn||1)*cW;}

  // Y range
  let allV=[];
  for(const k of SEL){
    const[f,t]=k.split('-').map(Number);
    for(const y of HIST_YRS){const v=yrVal(f,t,y,AM);if(v!=null)allV.push(v);}
    const p=HAS_25?yrVal(f,t,2025,AM):proj25(f,t,AM);
    if(p!=null)allV.push(p);
  }
  if(!allV.length)allV=[0,100];
  const ymx=Math.max(...allV)*1.18||1;
  function yp(v){return cH-(v/ymx)*cH;}
  function fy(v){
    if(AM==='pct')return v.toFixed(0)+'%';
    if(AM==='count')return v>=1e6?(v/1e6).toFixed(1)+'M':v>=1e3?(v/1e3).toFixed(0)+'k':v.toFixed(0);
    return v>=1e9?(v/1e9).toFixed(1)+'B':v>=1e6?(v/1e6).toFixed(1)+'M':v.toFixed(0);
  }

  let s=\`<svg viewBox="0 0 \${W} \${H}" width="100%" style="display:block" xmlns="http://www.w3.org/2000/svg">\`;
  s+=\`<g transform="translate(\${mg.l},\${mg.t})">\`;

  // Grid
  for(let i=0;i<=4;i++){
    const v=ymx*i/4,y=yp(v);
    s+=\`<line x1="0" y1="\${y}" x2="\${cW}" y2="\${y}" stroke="#2a3148" stroke-width="1"/>\`;
    s+=\`<text x="-7" y="\${y+4}" text-anchor="end" font-size="10" fill="#475569">\${fy(v)}</text>\`;
  }
  // X ticks
  for(const yr of CHART_YRS){
    const x=xp(yr),is25=yr===2025;
    s+=\`<line x1="\${x}" y1="\${cH}" x2="\${x}" y2="\${cH+4}" stroke="#475569"/>\`;
    s+=\`<text x="\${x}" y="\${cH+16}" text-anchor="middle" font-size="10" fill="\${is25?'#f0b429':'#94a3b8'}">\${yr}</text>\`;
  }
  // Axes
  s+=\`<line x1="0" y1="0" x2="0" y2="\${cH}" stroke="#2a3148" stroke-width="1.5"/>\`;
  s+=\`<line x1="0" y1="\${cH}" x2="\${cW}" y2="\${cH}" stroke="#2a3148" stroke-width="1.5"/>\`;

  // Projection divider
  if(HIST_YRS.length&&!HAS_25){
    const lx=xp(HIST_YRS.at(-1)),rx=xp(2025),sx=(lx+rx)/2;
    s+=\`<line x1="\${sx}" y1="0" x2="\${sx}" y2="\${cH}" stroke="#2a3148" stroke-dasharray="3,3"/>\`;
    s+=\`<text x="\${sx+3}" y="11" font-size="9" fill="#475569">proyección →</text>\`;
  }

  // Lines per selected transition
  for(const k of SEL){
    const[f,t]=k.split('-').map(Number),col=COLOR_MAP[k]||'#94a3b8';
    const hp=HIST_YRS.map(y=>{const v=yrVal(f,t,y,AM);return v!=null?{x:xp(y),y:yp(v)}:null;}).filter(Boolean);
    const v25=HAS_25?yrVal(f,t,2025,AM):proj25(f,t,AM);

    if(hp.length>1){
      s+=\`<polyline points="\${hp.map(p=>p.x+','+p.y).join(' ')}" fill="none" stroke="\${col}" stroke-width="2" stroke-linejoin="round"/>\`;
    }
    for(const p of hp)s+=\`<circle cx="\${p.x}" cy="\${p.y}" r="4" fill="\${col}" stroke="#0f1117" stroke-width="1.5"/>\`;

    if(v25!=null&&hp.length>0){
      const lp=hp.at(-1),x25=xp(2025),y25=yp(v25);
      s+=\`<line x1="\${lp.x}" y1="\${lp.y}" x2="\${x25}" y2="\${y25}" stroke="\${col}" stroke-width="2" stroke-dasharray="5,4" opacity=".85"/>\`;
      s+=\`<circle cx="\${x25}" cy="\${y25}" r="4" fill="none" stroke="\${col}" stroke-width="2"/>\`;
    }

    // Inline label at last point
    if(hp.length){
      const lp=hp.at(-1);
      s+=\`<text x="\${lp.x+6}" y="\${lp.y+4}" font-size="10" fill="\${col}" opacity=".9">\${f}→\${t}</text>\`;
    }
  }

  s+='</g></svg>';
  wrap.innerHTML=s;
  document.getElementById('proj-note').textContent=HAS_25?'2025: datos reales (línea punteada)':'* 2025: proyección por regresión lineal sobre datos históricos';
}

// ── toggles ───────────────────────────────────────────────────────────────────

function renderToggles(){
  const ks=[...new Set(D.cells.filter(c=>c.count>0).map(c=>c.fromState+'-'+c.toState))];
  document.getElementById('togs').innerHTML=
    '<span style="font-size:10px;color:#475569;margin-right:4px;align-self:center">Líneas en gráfica:</span>'+
    ks.map(k=>{
      const[f,t]=k.split('-'),col=COLOR_MAP[k]||'#94a3b8',on=SEL.has(k);
      return\`<button class="tg\${on?' on':''}" style="border-color:\${col};color:\${col}" onclick="togLine('\${k}')">\${f}→\${t}</button>\`;
    }).join('');
}

// ── year + metric buttons ─────────────────────────────────────────────────────

function renderYrBtns(){
  const yrs=['all',...ALL_YRS];
  document.getElementById('yr-btns').innerHTML=yrs.map(y=>{
    const lbl=y==='all'?'Todos':String(y)+(y===2025&&HAS_25?' ⊙':'');
    return\`<button class="btn\${y===AY?' on':''}" onclick="setYr(\`+JSON.stringify(y)+\`)">\${lbl}</button>\`;
  }).join('');
}

function renderMtBtns(){
  document.getElementById('mt-btns').innerHTML=Object.entries(MET).map(([k,m])=>
    \`<button class="btn\${k===AM?' on':''}" onclick="setMt('\${k}')">\${m.l}</button>\`
  ).join('');
}

// ── KPIs ──────────────────────────────────────────────────────────────────────

function renderKPIs(){
  const total=D.cells.reduce((s,c)=>s+c.count,0);
  const totalS=D.cells.reduce((s,c)=>s+c.saldo,0);
  const fc=(f,t)=>D.cells.find(c=>c.fromState===f&&c.toState===t);
  const r00=fc(0,0),r10=fc(1,0),d01=fc(0,1);
  const ks=[
    {l:'Total transiciones',v:total.toLocaleString('es-MX'),s:'pares mes a mes (todos los años)'},
    {l:'Saldo analizado',v:'$'+(totalS/1e9).toFixed(2)+'B MXN',s:'suma saldotarjeta destino'},
    r00&&{l:'Retención 0→0',v:r00.pct.toFixed(1)+'%',s:'al corriente se mantiene'},
    r10&&{l:'Recuperación 1→0',v:r10.pct.toFixed(1)+'%',s:'mora 1–30d regresa a corriente'},
    d01&&{l:'Deterioro 0→1',v:d01.pct.toFixed(1)+'%',s:'al corriente cae a mora'},
  ].filter(Boolean);
  document.getElementById('kpis').innerHTML=ks.map(k=>
    \`<div class="kpi"><div class="kl">\${k.l}</div><div class="kv">\${k.v}</div><div class="ks">\${k.s}</div></div>\`
  ).join('');
}

// ── events ────────────────────────────────────────────────────────────────────

function setYr(y){AY=y==='all'?'all':Number(y);renderYrBtns();renderMtx();}
function setMt(m){AM=m;renderMtBtns();renderMtx();renderChart();}
function togLine(k){SEL.has(k)?SEL.delete(k):SEL.add(k);renderToggles();renderChart();}

// ── init ──────────────────────────────────────────────────────────────────────

const tot=D.cells.reduce((s,c)=>s+c.count,0);
document.getElementById('ttl').textContent=D.title;
document.getElementById('sub').textContent='Probabilidades de transición entre estados de morosidad · '+tot.toLocaleString('es-MX')+' transiciones'+(ALL_YRS.length?' · '+ALL_YRS.length+' año(s) disponibles':'');
renderYrBtns();renderMtBtns();renderMtx();renderToggles();renderChart();renderKPIs();
</script>
</body>
</html>`
}

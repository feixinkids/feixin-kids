const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const fonts=[["貓啃珠圓體", "\"MaokenZhuyuan\",\"Noto Sans TC\",sans-serif"], ["悠哉字體", "\"Yozai\",\"Noto Sans TC\",sans-serif"], ["寒蟬童圓體", "\"Chill\",\"Noto Sans TC\",sans-serif"], ["得意黑", "\"Smiley\",\"Noto Sans TC\",sans-serif"], ["Maple Mono Rounded", "\"Maple\",\"Noto Sans TC\",sans-serif"], ["辰宇落雁體", "\"ChenYu\",\"Noto Sans TC\",sans-serif"], ["思源黑體", "\"Noto Sans TC\",sans-serif"], ["jf open 粉圓", "\"Huninn\",\"Noto Sans TC\",sans-serif"]];
const themes=[
["car","小車車","男孩","#dff3ff","#ef746e","🚗"],["truck","挖土機","男孩","#fff0bd","#e59a22","🚧"],
["dino","恐龍","男孩","#dff4df","#65ad6b","🦕"],["rocket","火箭","男孩","#e8e3ff","#7b70d0","🚀"],
["zoo","動物樂園","男孩","#dff7ee","#df9853","🐾"],["castle","夢幻城堡","女孩","#ffe1ed","#b27bd1","🏰"],
["bear","小熊娃娃","女孩","#fff0db","#b8845e","🧸"],["unicorn","獨角獸","女孩","#f4e3ff","#e779af","🦄"],
["flower","小花朵","女孩","#fff0f5","#e9759a","🌸"],["strawberry","草莓","女孩","#ffe3e5","#e45e69","🍓"],
["rainbow","彩虹","中性","#e8f6ff","#ee82a2","🌈"],["star","星星","中性","#fff7d5","#ddb039","⭐"],
["cloud","雲朵","中性","#e7f4ff","#78afd2","☁️"],["forest","森林","中性","#e5f2de","#62a369","🌳"],
["panda","熊貓","中性","#f1f1f1","#555","🐼"],["ocean","海洋","中性","#ddf3f8","#45a0ba","🐳"],
["heart","愛心","中性","#ffe6ee","#e96f94","♥"],["balloon","氣球","中性","#ebefff","#7889df","🎈"]];
const S={name:"林小可",font:0,fontScale:1,color:"#4b3b52",outline:true,theme:"car",paper:"a4",qty:24,img:null,url:null,file:null,crop:{x:0,y:0,scale:1}};

const cc=$("#cropCanvas"),cx=cc.getContext("2d"),sc=$("#sheetCanvas"),ctx=sc.getContext("2d");
function fontButton(f,i){return `<button class="font-btn ${i===S.font?"active":""}" data-i="${i}" type="button"><span style="font-family:${f[1]}">${f[0]}</span></button>`}
function bindFontButtons(container){
  container.querySelectorAll(".font-btn").forEach(b=>b.onclick=()=>{
    S.font=+b.dataset.i;renderFonts();drawSheet()
  })
}
function renderFonts(){
  $("#fontCount").textContent=`${fonts.length} 款固定字體`;
  $("#fontGrid").innerHTML=fonts.map((f,i)=>fontButton(f,i)).join("");
  bindFontButtons($("#fontGrid"));
}
let filter="全部";
function renderFilters(){$("#filters").innerHTML=["全部","男孩","女孩","中性"].map(x=>`<button class="${x===filter?"active":""}" data-c="${x}">${x}</button>`).join("");$$("#filters button").forEach(b=>b.onclick=()=>{filter=b.dataset.c;renderFilters();renderThemes()})}
function renderThemes(){let list=themes.filter(t=>filter==="全部"||t[2]===filter);$("#backgroundGrid").innerHTML=list.map(t=>`<button class="bg-btn ${t[0]===S.theme?"active":""}" data-t="${t[0]}" type="button"><span class="swatch" style="background:${t[3]}">${t[5]}</span><span>${t[1]}</span></button>`).join("");$$(".bg-btn").forEach(b=>b.onclick=()=>{S.theme=b.dataset.t;renderThemes();drawSheet()})}
function stickerSizeLabel(paper,qty){
  const sizes={
    a4:{24:"約 6.3 × 3.2 cm",30:"約 6.3 × 2.5 cm",48:"約 4.6 × 2.0 cm"},
    "4x6":{16:"約 4.5 × 1.7 cm",20:"約 4.5 × 1.3 cm",24:"約 2.9 × 1.7 cm"}
  };
  return sizes[paper][qty]||"";
}
function renderQty(){
  let arr=S.paper==="a4"?[24,30,48]:[16,20,24];
  if(!arr.includes(S.qty))S.qty=arr[0];
  $("#quantities").innerHTML=arr.map(n=>`<button class="${n===S.qty?"active":""}" data-n="${n}" type="button">${n} 張<small>單張 ${stickerSizeLabel(S.paper,n)}</small></button>`).join("");
  $$("#quantities button").forEach(b=>b.onclick=()=>{S.qty=+b.dataset.n;renderQty();drawSheet()});
  $("#layoutHint").textContent=S.paper==="a4"
    ?"尺寸依目前版面留白、間距與頁尾估算。"
    :"16、20 張為左右版；24 張為較小型左右版。尺寸依 4×6 相片版面估算。";
}
function setPaper(p){S.paper=p;$$("#paperTabs button").forEach(b=>b.classList.toggle("active",b.dataset.paper===p));renderQty();drawSheet()}
function load(url){return new Promise((ok,no)=>{let i=new Image;i.onload=()=>ok(i);i.onerror=no;i.src=url})}
$("#photoInput").onchange=async e=>{let f=e.target.files?.[0];if(!f)return;if(S.url)URL.revokeObjectURL(S.url);S.url=URL.createObjectURL(f);S.img=await load(S.url);resetCrop();$("#photoTools").hidden=false;drawCrop();drawSheet()};
function resetCrop(){if(!S.img)return;S.crop={x:0,y:0,scale:Math.max(cc.width/S.img.width,cc.height/S.img.height)};$("#zoomRange").value=1}
function trans(){let w=S.img.width*S.crop.scale,h=S.img.height*S.crop.scale;return{x:(cc.width-w)/2+S.crop.x,y:(cc.height-h)/2+S.crop.y,w,h}}
function drawCrop(){cx.clearRect(0,0,cc.width,cc.height);if(!S.img)return;let t=trans();cx.drawImage(S.img,t.x,t.y,t.w,t.h)}
$("#centerBtn").onclick=()=>{resetCrop();drawCrop();drawSheet()};
$("#zoomRange").oninput=e=>{if(!S.img)return;S.crop.scale=Math.max(cc.width/S.img.width,cc.height/S.img.height)*+e.target.value;drawCrop();drawSheet()};
let drag,last;
$(".crop-wrap").onpointerdown=e=>{if(!S.img)return;drag=true;last=[e.clientX,e.clientY];e.currentTarget.setPointerCapture(e.pointerId)};
$(".crop-wrap").onpointermove=e=>{if(!drag)return;let r=cc.getBoundingClientRect();S.crop.x+=(e.clientX-last[0])*cc.width/r.width;S.crop.y+=(e.clientY-last[1])*cc.height/r.height;last=[e.clientX,e.clientY];drawCrop();drawSheet()};
$(".crop-wrap").onpointerup=()=>drag=false;
$(".crop-wrap").onwheel=e=>{if(!S.img)return;e.preventDefault();let base=Math.max(cc.width/S.img.width,cc.height/S.img.height),rel=S.crop.scale/base,n=Math.max(.5,Math.min(4,rel*(e.deltaY>0?.94:1.06)));S.crop.scale=base*n;$("#zoomRange").value=n;drawCrop();drawSheet()};

function rr(c,x,y,w,h,r){r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function cropImage(n=600){let o=document.createElement("canvas");o.width=o.height=n;if(!S.img)return o;let c=o.getContext("2d"),ring=205,t=trans(),sx=(cc.width-ring)/2,sy=(cc.height-ring)/2,k=n/ring;c.drawImage(S.img,(t.x-sx)*k,(t.y-sy)*k,t.w*k,t.h*k);return o}
function text(c,t,x,y,max,base){let fam=fonts[S.font][1],size=base*S.fontScale;c.font=`800 ${size}px ${fam}`;while(size>8&&c.measureText(t).width>max){size--;c.font=`800 ${size}px ${fam}`}c.textAlign="center";c.textBaseline="middle";c.lineJoin="round";if(S.outline){c.strokeStyle="#fff";c.lineWidth=Math.max(3,size*.14);c.strokeText(t,x,y)}c.fillStyle=S.color;c.fillText(t,x,y)}
function drawExcavator(c,x,y,s,color){
  c.save();c.translate(x,y);c.fillStyle=color;c.strokeStyle=color;c.lineWidth=Math.max(2,s*.05);
  c.fillRect(-s*.34,-s*.03,s*.5,s*.22);
  c.fillRect(-s*.18,-s*.28,s*.25,s*.26);
  c.beginPath();c.moveTo(s*.03,-s*.24);c.lineTo(s*.38,-s*.48);c.lineTo(s*.48,-s*.39);c.lineTo(s*.17,-s*.12);c.stroke();
  c.beginPath();c.moveTo(s*.48,-s*.39);c.lineTo(s*.56,-s*.12);c.lineTo(s*.38,-s*.09);c.closePath();c.fill();
  c.fillStyle="#5b5360";c.beginPath();c.ellipse(-s*.12,s*.24,s*.28,s*.11,0,0,Math.PI*2);c.fill();
  c.restore();
}
function decor(c,t,x,y,w,h){
  c.fillStyle=t[3];c.fillRect(x,y,w,h);
  const size=Math.min(w,h)*.60;
  c.save();c.globalAlpha=.40;c.textAlign="center";c.textBaseline="middle";
  if(t[0]==="truck"){
    drawExcavator(c,x+w*.15,y+h*.24,size,t[4]);
    drawExcavator(c,x+w*.86,y+h*.82,size,t[4]);
  }else{
    c.font=`${size}px "Apple Color Emoji","Segoe UI Emoji",sans-serif`;
    c.fillText(t[5],x+w*.15,y+h*.24);
    c.fillText(t[5],x+w*.86,y+h*.82);
  }
  c.restore();
}
function sticker(c,x,y,w,h,vertical){let t=themes.find(a=>a[0]===S.theme);c.save();rr(c,x,y,w,h,Math.min(w,h)*.1);c.clip();decor(c,t,x,y,w,h);let im=cropImage(),d,px,py;if(vertical){d=Math.min(w*.58,h*.54);px=x+(w-d)/2;py=y+h*.07}else{d=Math.min(h*.72,w*.34);px=x+w*.06;py=y+(h-d)/2}c.save();c.beginPath();c.arc(px+d/2,py+d/2,d/2,0,Math.PI*2);c.clip();if(S.img)c.drawImage(im,px,py,d,d);else{c.fillStyle="#ffffffbb";c.fillRect(px,py,d,d)}c.restore();c.strokeStyle="#fff";c.lineWidth=Math.max(3,d*.04);c.beginPath();c.arc(px+d/2,py+d/2,d/2-c.lineWidth/2,0,Math.PI*2);c.stroke();if(vertical)text(c,S.name,x+w/2,y+h*.82,w*.82,h*.15);else text(c,S.name,px+d+(w-(px-x)-d)*.48,y+h/2,w-(px-x)-d-w*.08,h*.23);c.restore();c.strokeStyle="#6b53651d";rr(c,x+.5,y+.5,w-1,h-1,Math.min(w,h)*.1);c.stroke()}
function layout(){
  if(S.paper==="a4"){
    let m={24:[3,8],30:[3,10],48:[4,12]}[S.qty];
    return[1240,1754,m[0],m[1],false,52,14]
  }
  if(S.qty===16)return[1200,1800,2,8,false,54,16];
  if(S.qty===20)return[1200,1800,2,10,false,54,14];
  return[1200,1800,3,8,false,54,14];
}
function drawSheet(){
  let [W,H,cols,rows,vertical,margin,gap]=layout();
  sc.width=W;sc.height=H;ctx.fillStyle="#fff";ctx.fillRect(0,0,W,H);
  const footerH=S.paper==="a4"?44:48;
  let w=(W-2*margin-(cols-1)*gap)/cols;
  let h=(H-2*margin-footerH-(rows-1)*gap)/rows;
  for(let r=0;r<rows;r++)for(let q=0;q<cols;q++)sticker(ctx,margin+q*(w+gap),margin+r*(h+gap),w,h,vertical);
  ctx.save();
  ctx.fillStyle="#8f818b";ctx.textAlign="center";ctx.textBaseline="middle";
  ctx.font=`500 ${S.paper==="a4"?18:20}px "Noto Sans TC",sans-serif`;
  ctx.fillText("© 2026 Feixin Kids · Design · Download · Print",W/2,H-margin/2);
  ctx.restore();
  $("#meta").textContent=`${S.paper==="a4"?"A4":"4×6"} · ${S.qty} 張`;
}
function dl(url,name){let a=document.createElement("a");a.href=url;a.download=name;a.click()}
$("#pngBtn").onclick=async()=>{await document.fonts.ready;drawSheet();dl(sc.toDataURL("image/png"),"feixin-kids-name-sticker.png");$("#exportStatus").textContent="PNG 已產生。"};
$("#pdfBtn").onclick=async()=>{await document.fonts.ready;drawSheet();if(!window.jspdf){$("#exportStatus").textContent="PDF 元件尚未載入。";return}let a4=S.paper==="a4",pdf=new window.jspdf.jsPDF({orientation:"portrait",unit:"mm",format:a4?"a4":[101.6,152.4]});pdf.addImage(sc.toDataURL("image/jpeg",.96),"JPEG",0,0,a4?210:101.6,a4?297:152.4);pdf.save("feixin-kids-name-sticker.pdf");$("#exportStatus").textContent="PDF 已產生。"};
$("#nameInput").oninput=e=>{S.name=e.target.value||" ";drawSheet()};$("#textColor").oninput=e=>{S.color=e.target.value;drawSheet()};$("#fontSizeRange").oninput=e=>{S.fontScale=+e.target.value/100;$("#fontSizeValue").textContent=e.target.value+"%";drawSheet()};$("#textOutline").onchange=e=>{S.outline=e.target.checked;drawSheet()};$$("#paperTabs button").forEach(b=>b.onclick=()=>setPaper(b.dataset.paper));
$("#resetBtn").onclick=()=>{Object.assign(S,{name:"林小可",font:0,fontScale:1,color:"#4b3b52",outline:true,theme:"car",paper:"a4",qty:24,file:null});$("#nameInput").value=S.name;$("#textColor").value=S.color;$("#fontSizeRange").value=100;$("#fontSizeValue").textContent="100%";$("#textOutline").checked=true;setPaper("a4");renderFonts();renderThemes();drawSheet()};


renderFonts();renderFilters();renderThemes();renderQty();drawSheet();
document.fonts.ready.then(()=>{
  drawSheet();
  $$(".font-btn").forEach((btn,i)=>{
    const family=fonts[i][1].split(",")[0].replaceAll("'","");
    const loaded=document.fonts.check(`24px ${family}`);
    btn.title=loaded?"字體已載入":"尚未找到此字型檔，正使用替代字體";
    btn.classList.toggle("font-missing",!loaded);
  });
});

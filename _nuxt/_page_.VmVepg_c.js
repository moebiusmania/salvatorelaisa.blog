import{d as P,b as r,c,e as a,f as g,j as y,t as D,F as B,p as L,i as T,l as $,s as E,r as k,D as C,g as x,w as F,L as G,J as b,E as I,I as R,G as A}from"./entry.WqRkM3dX.js";import{_ as J}from"./PostPreview.ODWZR4K5.js";import{q as S}from"./query.qmlbSCXk.js";import"./preview.IGQaO3-x.js";const z=s=>(L("data-v-0109f8bd"),s=s(),T(),s),H={class:"form-control"},K={class:"input-group"},O=["value"],Q=z(()=>a("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor"},[a("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M6 18L18 6M6 6l12 12"})],-1)),U=[Q],W={key:0},X=P({__name:"Search",props:{results:{},value:{}},emits:["typing","clear"],setup(s,{emit:o}){const n=o,u=t=>{const e=t.target;n("typing",e.value)};return(t,e)=>(r(),c(B,null,[a("form",H,[a("div",K,[a("input",{type:"text",value:t.value,placeholder:"Cerca tra gli articoli (per titolo)",class:"input input-bordered input-primary",onInput:u},null,40,O),t.value.length!==0?(r(),c("button",{key:0,class:"btn btn-square",type:"button",onClick:e[0]||(e[0]=_=>n("clear"))},U)):g("",!0)])]),t.value.length!==0?(r(),c("p",W,[y(" Risultato ricerca: "),a("strong",null,D(t.results),1),y(" articoli ")])):g("",!0)],64))}}),Y=$(X,[["__scopeId","data-v-0109f8bd"]]),Z=A("Pagination"),tt=s=>(L("data-v-29a0a227"),s=s(),T(),s),et=tt(()=>a("h1",{class:"text-base-content"},"Tutti gli articoli",-1)),p=10,ot=P({__name:"[page]",async setup(s){let o,n;const u=E(),t=k(""),e=k([]),_=parseInt(u.params.page),m=([o,n]=C(()=>S().where({draft:!1}).sort({date:-1}).find()),o=await o,n(),o),N=Math.ceil(m.length/p),d=([o,n]=C(()=>S().where({draft:!1}).sort({date:-1}).skip(p*(_-1)).limit(p).find()),o=await o,n(),o);e.value=d;const V=()=>{t.value="",e.value=d},q=l=>m.filter(h=>{var i;return(((i=h.title)==null?void 0:i.toString())||"").toLowerCase().includes(l.toLowerCase())}),M=async l=>{t.value=l,e.value=l.length>0?q(l):d};return(l,h)=>{const v=Y,i=J,j=Z;return r(),c("div",null,[et,x(v,{value:t.value,results:e.value.length,onTyping:M,onClear:V},null,8,["value","results"]),a("ul",null,[x(G,{name:"list"},{default:F(()=>[(r(!0),c(B,null,R(e.value,f=>{var w;return r(),b(i,{post:f,key:(w=f._path)==null?void 0:w.replace("/","")},null,8,["post"])}),128))]),_:1})]),t.value.length===0?(r(),b(j,{key:0,"total-pages":I(N),page:I(_),limit:p,"all-posts":e.value.length},null,8,["total-pages","page","all-posts"])):g("",!0)])}}}),lt=$(ot,[["__scopeId","data-v-29a0a227"]]);export{lt as default};

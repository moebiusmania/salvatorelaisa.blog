import{d as l,b as r,c as i,e,t as o,g as d,w as n,F as _,I as u,J as h,j as c,C as m,p as f,i as g,l as v}from"./entry.WqRkM3dX.js";const x=s=>(f("data-v-3d0f4ad3"),s=s(),g(),s),k={class:"text-secondary"},y={class:"text-base-content"},w={class:"dark:text-base-content"},B=x(()=>e("svg",{viewBox:"0 0 24 24",stroke:"currentColor","stroke-width":"2",fill:"none","stroke-linecap":"round","stroke-linejoin":"round"},[e("path",{d:"M5 12h14"}),e("path",{d:"M12 5l7 7-7 7"})],-1)),C=l({__name:"PostPreview",props:{post:{}},setup(s){return(t,I)=>{const a=m;return r(),i("li",null,[e("div",null,[e("span",k,o(new Date(t.post.date).toLocaleDateString("it-it",{year:"numeric",month:"long",day:"numeric"})),1)]),e("div",null,[d(a,{href:`/post${t.post._path}`},{default:n(()=>[e("h2",y,o(t.post.title),1)]),_:1},8,["href"]),e("div",null,[(r(!0),i(_,null,u(t.post.tags,p=>(r(),h(a,{class:"text-primary hover:text-primary",href:`/tags/${p}`},{default:n(()=>[c(o(p),1)]),_:2},1032,["href"]))),256))]),e("p",w,o(t.post.summary),1),d(a,{class:"text-primary hover:text-primary",href:`/post${t.post._path}`},{default:n(()=>[c(" Continua a leggere ("+o(t.post.readingTime.text.replace("min read","minuti"))+") ",1),B]),_:1},8,["href"])])])}}}),N=v(C,[["__scopeId","data-v-3d0f4ad3"]]);export{N as _};

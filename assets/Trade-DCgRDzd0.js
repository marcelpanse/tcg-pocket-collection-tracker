import{r as t,j as e,C as w,U as N}from"./index-DDe0y-HX.js";import{T,a as k,b as g,c as h}from"./tabs-Yq_Xhz5V.js";import{c as M,u as R,g as E,b as F,a as $,F as b}from"./FancyCard-D3eftZ15.js";import{t as m,e as j,b as _}from"./CardsDB-CePrsvJ-.js";function y({cards:s,cardElement:n}){const o=M(),i=t.useRef(null),a=t.useMemo(()=>[o.accessor("image",{id:"imageUrl"}),o.accessor("card_id",{id:"card_id"}),o.accessor("name",{id:"name"}),o.accessor("pack",{id:"pack"})],[]),f=R({columns:a,data:s,enableGrouping:!0,getCoreRowModel:F(),getGroupedRowModel:E(),initialState:{grouping:["pack"]}}).getRowModel().rows.map(d=>{const c={type:"header",row:d},x=d.subRows.map(u=>({type:"data",row:u})),p=[];for(let u=0;u<x.length;u+=5)p.push(x.slice(u,u+5));return{header:c,gridRows:p}}).flatMap(d=>[{type:"header",height:45,data:d.header},...d.gridRows.map(c=>({type:"gridRow",height:269,data:c}))]),C=$({getScrollElement:()=>i.current,count:f.length,estimateSize:d=>(f[d].type==="header"?45:269)+12,overscan:5});return e.jsx("div",{ref:i,className:"h-[calc(100vh-180px)] overflow-y-auto",children:e.jsx("div",{style:{height:`${C.getTotalSize()}px`,position:"relative"},className:"w-full",children:C.getVirtualItems().map(d=>{const c=f[d.index];return e.jsx("div",{style:{position:"absolute",top:0,left:0,width:"100%",height:`${d.size}px`,transform:`translateY(${d.start}px)`},children:c.type==="header"?e.jsx("h2",{className:"mx-auto mt-10 w-[900px] scroll-m-20 border-b pb-2 font-semibold text-3xl tracking-tight transition-colors first:mt-0",children:c.data.row.getValue("pack")}):e.jsx("div",{className:"flex justify-center gap-5",children:c.data.map(({row:x})=>{const p=x.original;return n(p)})})},d.key)})})})}function G({card:s}){const n=t.useMemo(()=>(s.amount_owned||1)-1,[s.amount_owned]),o=t.useMemo(()=>n*m[s.rarity],[n,s.rarity]);return e.jsxs("div",{className:"group flex w-fit flex-col items-center gap-y-2 rounded-lg border border-gray-700 p-4 shadow-md transition duration-200 hover:shadow-lg",children:[e.jsx(b,{card:s,selected:!0},`card_${s.card_id}`),e.jsxs("p",{className:"max-w-[130px] overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-[12px]",children:[s.card_id," - ",s.name]}),e.jsxs("div",{className:"flex flex-row gap-x-2",children:[e.jsx("div",{className:"rounded-xl bg-fuchsia-600",children:e.jsx("span",{className:"m-3 font-semibold text-lg",children:n})}),e.jsx("div",{className:"rounded-xl bg-gray-600",children:e.jsx("span",{className:"m-3 font-semibold text-lg",children:o})})]})]},`div_${s.card_id}`)}function I(){const{ownedCards:s}=t.use(w),n=t.useMemo(()=>j.filter(r=>r.tradeable).map(r=>r.id),[]),o=t.useMemo(()=>Object.fromEntries(Object.entries(m).filter(([r,l])=>l>0)),[]),i=t.useMemo(()=>s.filter(r=>r.amount_owned>1),[s]),a=t.useMemo(()=>_.filter(r=>i.findIndex(l=>l.card_id===r.card_id)>-1).map(r=>{var l;return{...r,amount_owned:(l=i.find(v=>v.card_id===r.card_id))==null?void 0:l.amount_owned}}),[i]);return e.jsx(y,{cards:a.filter(r=>Object.keys(o).includes(r.rarity)&&n.includes(r.expansion)),cardElement:r=>e.jsx(G,{card:r})})}function O({card:s}){return e.jsxs("div",{className:"group flex w-fit flex-col items-center gap-y-2 rounded-lg border border-gray-700 p-4 shadow-md transition duration-200 hover:shadow-lg",children:[e.jsx(b,{card:s,selected:!0,setIsSelected:()=>{}},`card_${s.card_id}`),e.jsxs("p",{className:"max-w-[130px] overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-[12px]",children:[s.card_id," - ",s.name]}),e.jsx("div",{className:"rounded-xl bg-gray-600",children:e.jsx("span",{className:"m-3 font-semibold text-lg",children:(s.amount_owned||1)-1})})]},`div_${s.card_id}`)}function S(){const{ownedCards:s}=t.use(w),n=t.useMemo(()=>j.filter(a=>a.tradeable).map(a=>a.id),[]),o=t.useMemo(()=>s.filter(a=>a.amount_owned>1),[s]),i=t.useMemo(()=>_.filter(a=>o.findIndex(r=>r.card_id===a.card_id)>-1).map(a=>{var r;return{...a,amount_owned:(r=o.find(l=>l.card_id===a.card_id))==null?void 0:r.amount_owned}}),[o]);return e.jsx(y,{cards:i.filter(a=>Object.keys(m).includes(a.rarity)&&n.includes(a.expansion)),cardElement:a=>e.jsx(O,{card:a})})}function z({card:s}){return e.jsxs("div",{className:"group flex w-fit flex-col items-center gap-y-2 rounded-lg border border-gray-700 p-4 shadow-md transition duration-200 hover:shadow-lg",children:[e.jsx(b,{card:s,selected:!0,setIsSelected:()=>{}},`card_${s.card_id}`),e.jsxs("p",{className:"max-w-[130px] overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-[12px]",children:[s.card_id," - ",s.name]}),e.jsx("div",{className:"rounded-xl bg-gray-600",children:e.jsx("span",{className:"m-3 font-semibold text-lg",children:m[s.rarity]})})]},`div_${s.card_id}`)}function V(){const{ownedCards:s}=t.use(w),n=t.useMemo(()=>_.filter(a=>s.findIndex(r=>r.card_id===a.card_id)===-1),[s]),o=t.useMemo(()=>j.filter(a=>a.tradeable).map(a=>a.id),[]),i=t.useMemo(()=>n.filter(a=>Object.keys(m).includes(a.rarity)&&o.includes(a.expansion)),[n]);return e.jsx(y,{cards:i,cardElement:a=>e.jsx(z,{card:a})})}function D(){const{user:s}=t.use(N);return s?e.jsx("div",{className:"flex flex-col gap-y-4",children:e.jsxs(T,{defaultValue:"looking_for",children:[e.jsx("div",{className:"mx-auto max-w-[900px]",children:e.jsxs(k,{className:"m-auto mt-4 mb-8",children:[e.jsx(g,{value:"looking_for",children:"Looking For"}),e.jsx(g,{value:"for_trade",children:"For Trade"}),e.jsx(g,{value:"buying_tokens",children:"Buying Tokens"})]})}),e.jsxs("div",{className:"mx-auto max-w-auto",children:[e.jsx(h,{value:"looking_for",children:e.jsx(V,{})}),e.jsx(h,{value:"for_trade",children:e.jsx(S,{})}),e.jsx(h,{value:"buying_tokens",children:e.jsx(I,{})})]})]})}):null}export{D as default};

import{j as e,r,C as b,i as w,s as C,h as p,t as y,U as N}from"./index-B9WDMZlr.js";import{R as k}from"./RarityFilter-rZ_j1drw.js";import{T as v,a as T,b as f,c as j}from"./tabs-fsT69rTt.js";import{C as g}from"./CardsTable-6_vHaa3N.js";import{A as u,S as x,a as m,b as h}from"./alert-C88MFm4u.js";function M(){return e.jsx("article",{className:"mx-auto grid max-w-4xl gap-5",children:e.jsxs(u,{className:"mb-8 border-2 border-slate-600 shadow-none",children:[e.jsx(x,{className:"h-4 w-4"}),e.jsx(m,{children:"You have no sellable cards!"}),e.jsx(h,{children:"If you believe you have sellable cards, go to the collections page and input your collected cards to see what you can sell."})]})})}const B=({rarityFilter:n})=>{const{ownedCards:o}=r.use(b),t=r.useMemo(()=>o.filter(s=>s.amount_owned>=3),[o]),l=r.useMemo(()=>w.filter(s=>t.findIndex(a=>a.card_id===s.card_id)>-1).map(s=>{var a;return{...s,amount_owned:(a=t.find(c=>c.card_id===s.card_id))==null?void 0:a.amount_owned}}),[t]),d=r.useMemo(()=>l.filter(s=>Object.keys(C).includes(s.rarity)),[l]),i=r.useMemo(()=>d.filter(s=>n.length===0||n.includes(s.rarity)),[d,n]);return d&&d.length>0?e.jsx(g,{cards:i}):e.jsx(M,{})};function E(){return e.jsx("article",{className:"mx-auto grid max-w-4xl gap-5",children:e.jsxs(u,{className:"mb-8 border-2 border-slate-600 shadow-none",children:[e.jsx(x,{className:"h-4 w-4"}),e.jsx(m,{children:"Go track your cards"}),e.jsx(h,{children:"By tracking your cards, you can see what cards you still need to get, what cards you can trade with friends, and how many trade tokens you can earn with your current collection."})]})})}function I(){return e.jsx("article",{className:"mx-auto grid max-w-4xl gap-5",children:e.jsxs(u,{className:"mb-8 border-2 border-slate-600 shadow-none",children:[e.jsx(x,{className:"h-4 w-4"}),e.jsx(m,{children:"You have no tradeable cards!"}),e.jsx(h,{children:"Go to the collections page and input your collected cards to see what you can trade."})]})})}const F=({rarityFilter:n})=>{const{ownedCards:o}=r.use(b);if(!o||o.every(a=>a.amount_owned<2))return e.jsx(E,{});const t=r.useMemo(()=>p.filter(a=>a.tradeable).map(a=>a.id),[]),l=r.useMemo(()=>o.filter(a=>a.amount_owned>1),[o]),d=r.useMemo(()=>w.filter(a=>l.findIndex(c=>c.card_id===a.card_id)>-1).map(a=>{var c;return{...a,amount_owned:(c=l.find(_=>_.card_id===a.card_id))==null?void 0:c.amount_owned}}),[l]),i=r.useMemo(()=>d.filter(a=>Object.keys(y).includes(a.rarity)&&t.includes(a.expansion)),[d]),s=r.useMemo(()=>i.filter(a=>n.length===0||n.includes(a.rarity)),[i,n]);return i&&i.length>0?e.jsx(g,{cards:s}):e.jsx(I,{})};function R(){return e.jsx("article",{className:"mx-auto grid max-w-4xl gap-5",children:e.jsxs(u,{className:"mb-8 border-2 border-slate-600 shadow-none",children:[e.jsx(x,{className:"h-4 w-4"}),e.jsx(m,{children:"You have all tradeable cards!"}),e.jsx(h,{children:"Make sure you come back here when new rarities and packs are available for trade."})]})})}const S=({rarityFilter:n})=>{const{ownedCards:o}=r.use(b),t=r.useMemo(()=>w.filter(s=>o.findIndex(a=>a.card_id===s.card_id)===-1||o[o.findIndex(a=>a.card_id===s.card_id)].amount_owned===0),[o]),l=r.useMemo(()=>p.filter(s=>s.tradeable).map(s=>s.id),[]),d=r.useMemo(()=>t.filter(s=>Object.keys(y).includes(s.rarity)&&l.includes(s.expansion)),[t]),i=r.useMemo(()=>d.filter(s=>n.length===0||n.includes(s.rarity)),[d,n]);return d&&d.length>0?e.jsx(g,{cards:i}):e.jsx(R,{})};function A(){return e.jsx("article",{className:"mx-auto grid max-w-4xl gap-5",children:e.jsxs(u,{className:"mb-8 border-2 border-slate-600 shadow-none",children:[e.jsx(x,{className:"h-4 w-4"}),e.jsx(m,{children:"Sign up to view your tradeable cards"}),e.jsx(h,{children:"By registering, you can keep track of your collection, trade with other users, and access exclusive features."})]})})}function U(){const{user:n}=r.use(N),[o,t]=r.useState([]);return n?e.jsx("div",{className:"flex flex-col gap-y-4",children:e.jsxs(v,{defaultValue:"looking_for",children:[e.jsxs("div",{className:"mx-auto max-w-[900px] flex flex-row flex-wrap align-center gap-4 p-8",children:[e.jsxs(T,{className:"flex-grow m-auto flex-wrap h-auto border-2 border-slate-600 rounded-md",children:[e.jsx(f,{value:"looking_for",children:"Looking For"}),e.jsx(f,{value:"for_trade",children:"For Trade"}),e.jsx(f,{value:"buying_tokens",children:"Buying Tokens"})]}),e.jsx(k,{rarityFilter:o,setRarityFilter:t})]}),e.jsxs("div",{className:"max-w-auto mx-4 md:mx-8",children:[e.jsx(j,{value:"looking_for",children:e.jsx(S,{rarityFilter:o})}),e.jsx(j,{value:"for_trade",children:e.jsx(F,{rarityFilter:o})}),e.jsx(j,{value:"buying_tokens",children:e.jsx(B,{rarityFilter:o})})]})]})}):e.jsx(A,{})}export{U as default};

import{j as e,F as T,r as o,B as C,D as B,k as A,l as I,m as M,M as O,n as z,i as E,u as R,I as U,U as L,C as V,o as P}from"./index-DZxv3qX6.js";import{A as Z,b as H}from"./alert-MvbcPXvE.js";import{P as Y,C as $,u as q}from"./CardsTable-BQBreeVU.js";import{T as _,a as F,b}from"./tabs-BAtfh8Qs.js";import{R as G}from"./RarityFilter-Bs775UH8.js";function J({card:a,onSelect:n,selected:l}){const c=()=>{n(a.card_id,!l)};return e.jsxs("div",{className:"flex flex-col items-center",children:[e.jsx(T,{card:a,selected:l,setIsSelected:c,size:"small"}),e.jsx("p",{className:"text-xs text-center mt-1",children:a.name})]})}const K=({children:a,className:n})=>e.jsx("div",{className:`max-h-[300px] overflow-y-auto border border-gray-300 rounded-md ${n}`,style:{maxHeight:"300px"},children:a});function Q({filteredCards:a,onBatchUpdate:n}){const[l,c]=o.useState(!1),[x,u]=o.useState(0),[g,h]=o.useState({}),[j,m]=o.useState(!1),S=a.length===0,p=o.useMemo(()=>a.reduce((s,t)=>(s.some(i=>i.card_id===t.card_id)||s.push(t),s),[]),[a]);o.useEffect(()=>{if(l){const s=p.reduce((t,i)=>(t[i.card_id]=!0,t),{});h(s)}},[l]);const v=(s,t)=>{h(i=>({...i,[s]:t}))},w=()=>{const s=p.reduce((t,i)=>(t[i.card_id]=!0,t),{});h(s)},N=()=>{const s=p.reduce((t,i)=>(t[i.card_id]=!1,t),{});h(s)},r=Object.values(g).filter(s=>s).length,d=()=>{x!==null&&(x>0?u(s=>(s||0)-1):x===0&&u(0))},f=()=>{u(s=>s?s+1:1)},D=s=>{const t=s.target.value.trim();if(t==="")u(0);else{const i=Number(t);Number.isNaN(i)?u(0):u(i<0?0:i)}},k=async()=>{m(!0);const s=Object.entries(g).filter(([t,i])=>i).map(([t])=>t);s.length>0&&(await n(s,x),c(!1),m(!1))};return e.jsxs(e.Fragment,{children:[e.jsx(C,{variant:"ghost",onClick:()=>c(!0),disabled:S,children:"Bulk update"}),e.jsx(B,{open:l,onOpenChange:c,children:e.jsxs(A,{className:"max-w-2xl",children:[e.jsx(I,{children:e.jsx(M,{children:"Bulk update cards"})}),e.jsx(Z,{variant:"destructive",children:e.jsxs(H,{children:["You are about to batch update"," ",e.jsxs("strong",{children:[e.jsx("span",{style:{fontSize:"1.25rem",color:"#f3f4f6",padding:"0.25rem 0.5rem",borderRadius:"0.375rem",margin:"0 0.25rem"},children:r})," ","cards"]})," ","based on your selected filters. Select the amount you'd like to set for each of the cards below. You can also select or deselect individual cards if you don’t want to update all of them. ",e.jsx("strong",{children:"Beware that this will overwrite all current values of the selected cards!"})," "]})}),e.jsxs("div",{className:"flex gap-2 justify-between",children:[e.jsx(C,{variant:"outline",onClick:N,children:"Deselect All"}),e.jsx(C,{variant:"outline",onClick:w,children:"Select All"})]}),e.jsx(K,{className:"h-64 rounded-md border p-4",children:e.jsx("div",{className:"grid grid-cols-6 gap-2",children:p.map(s=>e.jsx(J,{card:s,onSelect:v,selected:g[s.card_id]},s.card_id))})}),e.jsxs("div",{className:"flex items-center gap-x-1 justify-center",children:[e.jsx(C,{variant:"ghost",size:"icon",onClick:d,disabled:x===null||x===0,className:"rounded-full",children:e.jsx(O,{size:14})}),e.jsx("input",{type:"text",min:"0",value:x??0,onChange:D,placeholder:"Enter amount",className:"w-7 text-center border-none rounded",onFocus:s=>s.target.select()}),e.jsx(C,{variant:"ghost",size:"icon",onClick:f,className:"rounded-full",children:e.jsx(Y,{size:14})})]}),e.jsxs(z,{children:[e.jsx(C,{variant:"outline",onClick:()=>c(!1),children:"Cancel"}),e.jsxs(C,{onClick:k,disabled:r===0||j,variant:"default",children:[j&&e.jsxs("svg",{"aria-hidden":"true",className:"w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600",viewBox:"0 0 100 101",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:[e.jsx("path",{d:"M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z",fill:"currentColor"}),e.jsx("path",{d:"M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z",fill:"currentFill"})]}),"Batch ",j?"processing...":"update"]})]})]})})]})}const W=({expansionFilter:a,setExpansionFilter:n})=>e.jsx(_,{value:a,onValueChange:l=>n(l),className:"w-full",children:e.jsxs(F,{className:"w-full flex-wrap h-auto lg:h-[40px] border-2 border-slate-600 rounded-md",children:[e.jsx(b,{value:"all",children:"All"}),E.map(l=>e.jsx(b,{value:l.id,children:l.name},`tab_trigger_${l.id}`))]})}),X=({ownedFilter:a,setOwnedFilter:n})=>{const{t:l}=R("owned-filter");return e.jsx(_,{value:a,onValueChange:c=>n(c),className:"w-70",children:e.jsxs(F,{className:"w-full flex-wrap h-auto lg:h-10 bg-neutral-50 border-2 border-slate-600 rounded-md",children:[e.jsx(b,{value:"all",children:l("all")}),e.jsx(b,{value:"missing",children:l("missing")}),e.jsx(b,{value:"owned",children:l("owned")})]})})};let y=null;const ee=({setSearchValue:a})=>e.jsx(U,{type:"search",placeholder:"Search...",className:"w-full md:w-64 border-2 h-[38px]",style:{borderColor:"#45556C"},onChange:n=>{y&&window.clearTimeout(y),y=window.setTimeout(()=>{a(n.target.value)},500)}});function ne(){const{user:a}=o.useContext(L),{ownedCards:n,setOwnedCards:l}=o.useContext(V),[c,x]=o.useState(""),[u,g]=o.useState("all"),[h,j]=o.useState([]),[m,S]=o.useState("all"),[p,v]=o.useState(!1),w=o.useMemo(()=>{let r=P;return u!=="all"&&(r=r.filter(d=>d.expansion===u)),m!=="all"&&(m==="owned"?r=r.filter(d=>n.find(f=>f.card_id===d.card_id&&f.amount_owned>0)):m==="missing"&&(r=r.filter(d=>!n.find(f=>f.card_id===d.card_id&&f.amount_owned>0)))),h.length>0&&(r=r.filter(d=>h.includes(d.rarity))),c&&(r=r.filter(d=>d.name.toLowerCase().includes(c.toLowerCase())||d.card_id.toLowerCase().includes(c.toLowerCase()))),v(!0),setTimeout(()=>v(!1),100),r},[u,h,c,m]),N=async(r,d)=>{await q(r,d,n,l,a)};return e.jsxs("div",{className:"flex flex-col gap-y-1 mx-auto max-w-[900px]",children:[e.jsxs("div",{className:"flex items-center gap-2 flex-col md:flex-row px-8",children:[e.jsx(ee,{setSearchValue:x}),e.jsx(W,{expansionFilter:u,setExpansionFilter:g})]}),e.jsxs("div",{className:"items-center justify-between gap-2 flex-col md:flex-row px-8 md:flex",children:[e.jsx(X,{ownedFilter:m,setOwnedFilter:S}),e.jsx(G,{rarityFilter:h,setRarityFilter:j}),e.jsx(Q,{filteredCards:w,onBatchUpdate:N,disabled:w.length===0})]}),e.jsx("div",{children:e.jsx($,{cards:w,resetScrollTrigger:p})})]})}export{ne as default};

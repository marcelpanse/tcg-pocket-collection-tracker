import{e as T,r as s,U as k,C as $,f as z,D as C,h as j,I as E,j as e,L,B as v,M as I}from"./index-BawTVLHJ.js";import{T as S,a as V,b as y,c as N}from"./tabs-BFo3-HbA.js";import{e as M,b as G}from"./CardsDB-DnIgziLH.js";import{F as O,c as W,u as A,a as P,g as B,b as F}from"./FancyCard-BT_hW5zd.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const H=[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]],U=T("Plus",H);function R(){const{innerWidth:t,innerHeight:i}=window;return{width:t,height:i}}function q(){const[t,i]=s.useState(R());return s.useEffect(()=>{function l(){i(R())}return window.addEventListener("resize",l),()=>window.removeEventListener("resize",l)},[]),t}let b=null;function Y({card:t}){const{user:i,setIsLoginDialogOpen:l}=s.use(k),{ownedCards:m,setOwnedCards:p}=s.use($),r=s.useMemo(()=>{var a;return((a=m.find(o=>o.card_id===t.card_id))==null?void 0:a.amount_owned)||0},[m]),[w,x]=s.useState(0);s.useEffect(()=>{x(r)},[r]);const d=s.useCallback(async(a,o)=>{console.log(`${a} button clicked`);const u=await z(),h=m.find(g=>g.card_id===a);if(h)console.log("updating",h),h.amount_owned=Math.max(0,h.amount_owned+o),p([...m]),await u.updateDocument(C,j,h.$id,{amount_owned:h.amount_owned});else if(!h&&o>0){console.log("adding new card",a);const g=await u.createDocument(C,j,E.unique(),{email:i==null?void 0:i.email,card_id:a,amount_owned:o});p([...m,{$id:g.$id,email:g.email,card_id:g.card_id,amount_owned:g.amount_owned}])}x(Math.max(0,r+o))},[m,i,p,r]),f=s.useCallback(async a=>{if(!i){l(!0);return}await d(a,1)},[d]),n=s.useCallback(async a=>{if(!i){l(!0);return}r>0&&await d(a,-1)},[d,r]),c=a=>{const o=a.target.value===""?0:Number.parseInt(a.target.value,10);!Number.isNaN(o)&&o>=0&&(x(o),b&&window.clearTimeout(b),b=window.setTimeout(async()=>{await d(t.card_id,o-r)},300))};return e.jsxs("div",{className:"group flex w-fit flex-col items-center rounded-lg",children:[e.jsx(L,{viewTransition:!0,to:`/card/${t.card_id}`,state:{card:t},children:e.jsx(O,{card:t,selected:r>0})}),e.jsxs("p",{className:"max-w-[130px] overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-[12px] pt-2",children:[t.card_id," - ",t.name]}),e.jsxs("div",{className:"flex items-center gap-x-1",children:[e.jsx(v,{variant:"ghost",size:"icon",onClick:()=>n(t.card_id),className:"rounded-full",children:e.jsx(I,{})}),e.jsx("input",{min:"0",max:"99",type:"text",value:w,onChange:c,className:"w-7 text-center border-none rounded",onFocus:a=>a.target.select()}),e.jsx(v,{variant:"ghost",size:"icon",className:"rounded-full",onClick:()=>f(t.card_id),children:e.jsx(U,{})})]})]})}const _=W();function D({cards:t}){const i=s.useRef(null),{width:l}=q(),m=s.useMemo(()=>[_.accessor("image",{id:"imageUrl"}),_.accessor("card_id",{id:"card_id"}),_.accessor("name",{id:"name"}),_.accessor("set_details",{id:"set_details"})],[]),p=A({columns:m,data:t,enableGrouping:!0,getCoreRowModel:F(),getGroupedRowModel:B(),initialState:{grouping:["set_details"]}}),r=s.useMemo(()=>p.getGroupedRowModel().rows,[p.getGroupedRowModel().rows]);let w=5;l>800&&l<1e3?w=4:l<=800&&(w=3);const x=s.useMemo(()=>r.map(n=>{const c={type:"header",row:n},a=n.subRows.map(u=>({type:"data",row:u})),o=[];for(let u=0;u<a.length;u+=w)o.push(a.slice(u,u+w));return{header:c,gridRows:o}}),[r,w]),d=s.useMemo(()=>x.flatMap(n=>[{type:"header",height:60,data:n.header},...n.gridRows.map(c=>({type:"gridRow",height:250,data:c}))]),[x]),f=P({getScrollElement:()=>i.current,count:d.length,estimateSize:n=>(d[n].type==="header"?60:250)+12,overscan:5});return e.jsx("div",{ref:i,className:"h-[calc(100vh-180px)] overflow-y-auto",style:{scrollbarWidth:"none"},children:e.jsx("div",{style:{height:`${f.getTotalSize()}px`},className:"relative w-full",children:f.getVirtualItems().map(n=>{const c=d[n.index];return e.jsx("div",{style:{height:`${n.size}px`,transform:`translateY(${n.start}px)`},className:"absolute top-0 left-0 w-full",children:c.type==="header"?e.jsx("h2",{className:"mt-10 text-center w-full scroll-m-20 border-b border-gray-200 pb-2 font-semibold text-3xl tracking-tight transition-colors first:mt-0",children:c.data.row.getValue("set_details")}):e.jsx("div",{className:"flex justify-center gap-x-3",children:c.data.map(({row:a})=>e.jsx(Y,{card:a.original},a.original.card_id))})},n.key)})})})}function Z(){return e.jsx("div",{className:"mx-auto flex max-w-[900px] flex-col gap-y-4 px-4",children:e.jsxs(S,{defaultValue:"all",children:[e.jsxs(V,{className:"w-full m-auto mt-4 mb-8 flex-wrap h-auto",children:[e.jsx(y,{value:"all",children:"All"}),M.map(t=>e.jsx(y,{value:t.id,children:t.name},`tab_trigger_${t.id}`))]}),e.jsx(N,{value:"all",children:e.jsx(D,{cards:G})}),M.map(t=>e.jsx(N,{value:t.id,children:e.jsx(D,{cards:t.cards},`tab_content_${t.id}`)},`tab_content_${t.id}`))]})})}export{Z as default};

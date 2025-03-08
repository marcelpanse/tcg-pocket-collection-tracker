import{r as d,a1 as P,G as F,j as c,d as $,J as D,e as g,$ as h,a2 as G,a0 as V,L as p,O as L,c as m}from"./index-CeUcKr8K.js";var T="Tabs",[K,Q]=$(T,[h]),y=h(),[B,x]=K(T),N=d.forwardRef((e,a)=>{const{__scopeTabs:t,value:n,onValueChange:r,defaultValue:l,orientation:s="horizontal",dir:u,activationMode:v="automatic",...b}=e,i=P(u),[o,f]=F({prop:n,onChange:r,defaultProp:l});return c.jsx(B,{scope:t,baseId:D(),value:o,onValueChange:f,orientation:s,dir:i,activationMode:v,children:c.jsx(g.div,{dir:i,"data-orientation":s,...b,ref:a})})});N.displayName=T;var C="TabsList",w=d.forwardRef((e,a)=>{const{__scopeTabs:t,loop:n=!0,...r}=e,l=x(C,t),s=y(t);return c.jsx(G,{asChild:!0,...s,orientation:l.orientation,dir:l.dir,loop:n,children:c.jsx(g.div,{role:"tablist","aria-orientation":l.orientation,...r,ref:a})})});w.displayName=C;var I="TabsTrigger",R=d.forwardRef((e,a)=>{const{__scopeTabs:t,value:n,disabled:r=!1,...l}=e,s=x(I,t),u=y(t),v=A(s.baseId,n),b=k(s.baseId,n),i=n===s.value;return c.jsx(V,{asChild:!0,...u,focusable:!r,active:i,children:c.jsx(g.button,{type:"button",role:"tab","aria-selected":i,"aria-controls":b,"data-state":i?"active":"inactive","data-disabled":r?"":void 0,disabled:r,id:v,...l,ref:a,onMouseDown:p(e.onMouseDown,o=>{!r&&o.button===0&&o.ctrlKey===!1?s.onValueChange(n):o.preventDefault()}),onKeyDown:p(e.onKeyDown,o=>{[" ","Enter"].includes(o.key)&&s.onValueChange(n)}),onFocus:p(e.onFocus,()=>{const o=s.activationMode!=="manual";!i&&!r&&o&&s.onValueChange(n)})})})});R.displayName=I;var j="TabsContent",_=d.forwardRef((e,a)=>{const{__scopeTabs:t,value:n,forceMount:r,children:l,...s}=e,u=x(j,t),v=A(u.baseId,n),b=k(u.baseId,n),i=n===u.value,o=d.useRef(i);return d.useEffect(()=>{const f=requestAnimationFrame(()=>o.current=!1);return()=>cancelAnimationFrame(f)},[]),c.jsx(L,{present:r||i,children:({present:f})=>c.jsx(g.div,{"data-state":i?"active":"inactive","data-orientation":u.orientation,role:"tabpanel","aria-labelledby":v,hidden:!f,id:b,tabIndex:0,...s,ref:a,style:{...e.style,animationDuration:o.current?"0s":void 0},children:f&&l})})});_.displayName=j;function A(e,a){return`${e}-trigger-${a}`}function k(e,a){return`${e}-content-${a}`}var O=N,E=w,S=R,M=_;const U=O,q=d.forwardRef(({className:e,...a},t)=>c.jsx(E,{ref:t,className:m("inline-flex h-9 items-center justify-center rounded-lg bg-neutral-100 p-1 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400",e),...a}));q.displayName=E.displayName;const z=d.forwardRef(({className:e,...a},t)=>c.jsx(S,{ref:t,className:m("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 font-medium text-sm ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-neutral-950 data-[state=active]:shadow dark:ring-offset-neutral-950 dark:data-[state=active]:bg-neutral-950 dark:data-[state=active]:text-neutral-50 dark:focus-visible:ring-neutral-300",e),...a}));z.displayName=S.displayName;const H=d.forwardRef(({className:e,...a},t)=>c.jsx(M,{ref:t,className:m("mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 dark:ring-offset-neutral-950 dark:focus-visible:ring-neutral-300",e),...a}));H.displayName=M.displayName;export{U as T,q as a,z as b,H as c};

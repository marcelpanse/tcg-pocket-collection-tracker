import{r as c,N as k,A as j,j as a,O as ce,d as I,E as ue,Q as S,e as b,K as m,S as D,L as F,T as de,V as pe,W as ve,X as ge,Y as fe,Z as xe,_ as he,$ as me,a0 as Pe,c as y,R as g,G as M,J as Ce,z as be,H as we,a1 as Re,u as je,B as ye}from"./index-UOSCy24w.js";var N="Popover",[z,Ze]=I(N,[k]),w=k(),[_e,h]=z(N),$=e=>{const{__scopePopover:r,children:t,open:n,defaultOpen:o,onOpenChange:s,modal:l=!1}=e,i=w(r),u=c.useRef(null),[d,p]=c.useState(!1),[v=!1,f]=j({prop:n,defaultProp:o,onChange:s});return a.jsx(ce,{...i,children:a.jsx(_e,{scope:r,contentId:ue(),triggerRef:u,open:v,onOpenChange:f,onOpenToggle:c.useCallback(()=>f(_=>!_),[f]),hasCustomAnchor:d,onCustomAnchorAdd:c.useCallback(()=>p(!0),[]),onCustomAnchorRemove:c.useCallback(()=>p(!1),[]),modal:l,children:t})})};$.displayName=N;var V="PopoverAnchor",Ne=c.forwardRef((e,r)=>{const{__scopePopover:t,...n}=e,o=h(V,t),s=w(t),{onCustomAnchorAdd:l,onCustomAnchorRemove:i}=o;return c.useEffect(()=>(l(),()=>i()),[l,i]),a.jsx(D,{...s,...n,ref:r})});Ne.displayName=V;var L="PopoverTrigger",W=c.forwardRef((e,r)=>{const{__scopePopover:t,...n}=e,o=h(L,t),s=w(t),l=S(r,o.triggerRef),i=a.jsx(b.button,{type:"button","aria-haspopup":"dialog","aria-expanded":o.open,"aria-controls":o.contentId,"data-state":Z(o.open),...n,ref:l,onClick:m(e.onClick,o.onOpenToggle)});return o.hasCustomAnchor?i:a.jsx(D,{asChild:!0,...s,children:i})});W.displayName=L;var T="PopoverPortal",[Te,Ae]=z(T,{forceMount:void 0}),H=e=>{const{__scopePopover:r,forceMount:t,children:n,container:o}=e,s=h(T,r);return a.jsx(Te,{scope:r,forceMount:t,children:a.jsx(F,{present:t||s.open,children:a.jsx(de,{asChild:!0,container:o,children:n})})})};H.displayName=T;var P="PopoverContent",B=c.forwardRef((e,r)=>{const t=Ae(P,e.__scopePopover),{forceMount:n=t.forceMount,...o}=e,s=h(P,e.__scopePopover);return a.jsx(F,{present:n||s.open,children:s.modal?a.jsx(Ge,{...o,ref:r}):a.jsx(Oe,{...o,ref:r})})});B.displayName=P;var Ge=c.forwardRef((e,r)=>{const t=h(P,e.__scopePopover),n=c.useRef(null),o=S(r,n),s=c.useRef(!1);return c.useEffect(()=>{const l=n.current;if(l)return pe(l)},[]),a.jsx(ve,{as:ge,allowPinchZoom:!0,children:a.jsx(K,{...e,ref:o,trapFocus:t.open,disableOutsidePointerEvents:!0,onCloseAutoFocus:m(e.onCloseAutoFocus,l=>{var i;l.preventDefault(),s.current||(i=t.triggerRef.current)==null||i.focus()}),onPointerDownOutside:m(e.onPointerDownOutside,l=>{const i=l.detail.originalEvent,u=i.button===0&&i.ctrlKey===!0,d=i.button===2||u;s.current=d},{checkForDefaultPrevented:!1}),onFocusOutside:m(e.onFocusOutside,l=>l.preventDefault(),{checkForDefaultPrevented:!1})})})}),Oe=c.forwardRef((e,r)=>{const t=h(P,e.__scopePopover),n=c.useRef(!1),o=c.useRef(!1);return a.jsx(K,{...e,ref:r,trapFocus:!1,disableOutsidePointerEvents:!1,onCloseAutoFocus:s=>{var l,i;(l=e.onCloseAutoFocus)==null||l.call(e,s),s.defaultPrevented||(n.current||(i=t.triggerRef.current)==null||i.focus(),s.preventDefault()),n.current=!1,o.current=!1},onInteractOutside:s=>{var u,d;(u=e.onInteractOutside)==null||u.call(e,s),s.defaultPrevented||(n.current=!0,s.detail.originalEvent.type==="pointerdown"&&(o.current=!0));const l=s.target;((d=t.triggerRef.current)==null?void 0:d.contains(l))&&s.preventDefault(),s.detail.originalEvent.type==="focusin"&&o.current&&s.preventDefault()}})}),K=c.forwardRef((e,r)=>{const{__scopePopover:t,trapFocus:n,onOpenAutoFocus:o,onCloseAutoFocus:s,disableOutsidePointerEvents:l,onEscapeKeyDown:i,onPointerDownOutside:u,onFocusOutside:d,onInteractOutside:p,...v}=e,f=h(P,t),_=w(t);return fe(),a.jsx(xe,{asChild:!0,loop:!0,trapped:n,onMountAutoFocus:o,onUnmountAutoFocus:s,children:a.jsx(he,{asChild:!0,disableOutsidePointerEvents:l,onInteractOutside:p,onEscapeKeyDown:i,onPointerDownOutside:u,onFocusOutside:d,onDismiss:()=>f.onOpenChange(!1),children:a.jsx(me,{"data-state":Z(f.open),role:"dialog",id:f.contentId,..._,...v,ref:r,style:{...v.style,"--radix-popover-content-transform-origin":"var(--radix-popper-transform-origin)","--radix-popover-content-available-width":"var(--radix-popper-available-width)","--radix-popover-content-available-height":"var(--radix-popper-available-height)","--radix-popover-trigger-width":"var(--radix-popper-anchor-width)","--radix-popover-trigger-height":"var(--radix-popper-anchor-height)"}})})})}),U="PopoverClose",Ee=c.forwardRef((e,r)=>{const{__scopePopover:t,...n}=e,o=h(U,t);return a.jsx(b.button,{type:"button",...n,ref:r,onClick:m(e.onClick,()=>o.onOpenChange(!1))})});Ee.displayName=U;var ke="PopoverArrow",Ie=c.forwardRef((e,r)=>{const{__scopePopover:t,...n}=e,o=w(t);return a.jsx(Pe,{...o,...n,ref:r})});Ie.displayName=ke;function Z(e){return e?"open":"closed"}var Se=$,De=W,Fe=H,J=B;const Me=Se,ze=De,Q=c.forwardRef(({className:e,align:r="center",sideOffset:t=4,...n},o)=>a.jsx(Fe,{children:a.jsx(J,{ref:o,align:r,sideOffset:t,className:y("z-50 w-72 rounded-md border border-neutral-200 bg-white p-4 text-neutral-950 shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50",e),...n})}));Q.displayName=J.displayName;var $e="Toggle",A=c.forwardRef((e,r)=>{const{pressed:t,defaultPressed:n=!1,onPressedChange:o,...s}=e,[l=!1,i]=j({prop:t,onChange:o,defaultProp:n});return a.jsx(b.button,{type:"button","aria-pressed":l,"data-state":l?"on":"off","data-disabled":e.disabled?"":void 0,...s,ref:r,onClick:m(e.onClick,()=>{e.disabled||i(!l)})})});A.displayName=$e;var X=A,C="ToggleGroup",[Y,Je]=I(C,[M]),q=M(),G=g.forwardRef((e,r)=>{const{type:t,...n}=e;if(t==="single"){const o=n;return a.jsx(Ve,{...o,ref:r})}if(t==="multiple"){const o=n;return a.jsx(Le,{...o,ref:r})}throw new Error(`Missing prop \`type\` expected on \`${C}\``)});G.displayName=C;var[ee,oe]=Y(C),Ve=g.forwardRef((e,r)=>{const{value:t,defaultValue:n,onValueChange:o=()=>{},...s}=e,[l,i]=j({prop:t,defaultProp:n,onChange:o});return a.jsx(ee,{scope:e.__scopeToggleGroup,type:"single",value:l?[l]:[],onItemActivate:i,onItemDeactivate:g.useCallback(()=>i(""),[i]),children:a.jsx(te,{...s,ref:r})})}),Le=g.forwardRef((e,r)=>{const{value:t,defaultValue:n,onValueChange:o=()=>{},...s}=e,[l=[],i]=j({prop:t,defaultProp:n,onChange:o}),u=g.useCallback(p=>i((v=[])=>[...v,p]),[i]),d=g.useCallback(p=>i((v=[])=>v.filter(f=>f!==p)),[i]);return a.jsx(ee,{scope:e.__scopeToggleGroup,type:"multiple",value:l,onItemActivate:u,onItemDeactivate:d,children:a.jsx(te,{...s,ref:r})})});G.displayName=C;var[We,He]=Y(C),te=g.forwardRef((e,r)=>{const{__scopeToggleGroup:t,disabled:n=!1,rovingFocus:o=!0,orientation:s,dir:l,loop:i=!0,...u}=e,d=q(t),p=be(l),v={role:"group",dir:p,...u};return a.jsx(We,{scope:t,rovingFocus:o,disabled:n,children:o?a.jsx(we,{asChild:!0,...d,orientation:s,dir:p,loop:i,children:a.jsx(b.div,{...v,ref:r})}):a.jsx(b.div,{...v,ref:r})})}),R="ToggleGroupItem",re=g.forwardRef((e,r)=>{const t=oe(R,e.__scopeToggleGroup),n=He(R,e.__scopeToggleGroup),o=q(e.__scopeToggleGroup),s=t.value.includes(e.value),l=n.disabled||e.disabled,i={...e,pressed:s,disabled:l},u=g.useRef(null);return n.rovingFocus?a.jsx(Ce,{asChild:!0,...o,focusable:!l,active:s,ref:u,children:a.jsx(O,{...i,ref:r})}):a.jsx(O,{...i,ref:r})});re.displayName=R;var O=g.forwardRef((e,r)=>{const{__scopeToggleGroup:t,value:n,...o}=e,s=oe(R,t),l={role:"radio","aria-checked":e.pressed,"aria-pressed":void 0},i=s.type==="single"?l:void 0;return a.jsx(A,{...i,...o,ref:r,onPressedChange:u=>{u?s.onItemActivate(n):s.onItemDeactivate(n)}})}),ae=G,ne=re;const se=Re("inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors hover:bg-neutral-100 hover:text-neutral-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-neutral-100 data-[state=on]:text-neutral-900 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 dark:hover:bg-neutral-800 dark:hover:text-neutral-400 dark:focus-visible:ring-neutral-300 dark:data-[state=on]:bg-neutral-800 dark:data-[state=on]:text-neutral-50",{variants:{variant:{default:"bg-transparent",outline:"border border-neutral-200 bg-transparent shadow-sm hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"},size:{default:"h-9 px-2 min-w-9",sm:"h-8 px-1.5 min-w-8",lg:"h-10 px-2.5 min-w-10"}},defaultVariants:{variant:"default",size:"default"}}),Be=c.forwardRef(({className:e,variant:r,size:t,...n},o)=>a.jsx(X,{ref:o,className:y(se({variant:r,size:t,className:e})),...n}));Be.displayName=X.displayName;const le=c.createContext({size:"default",variant:"default"}),ie=c.forwardRef(({className:e,variant:r,size:t,children:n,...o},s)=>a.jsx(ae,{ref:s,className:y("flex items-center justify-center gap-1",e),...o,children:a.jsx(le.Provider,{value:{variant:r,size:t},children:n})}));ie.displayName=ae.displayName;const x=c.forwardRef(({className:e,children:r,variant:t,size:n,...o},s)=>{const l=c.useContext(le);return a.jsx(ne,{ref:s,className:y(se({variant:l.variant||t,size:l.size||n}),e),...o,children:r})});x.displayName=ne.displayName;function E(){const{innerWidth:e,innerHeight:r}=window;return{width:e,height:r}}function Ke(){const[e,r]=c.useState(E());return c.useEffect(()=>{function t(){r(E())}return window.addEventListener("resize",t),()=>window.removeEventListener("resize",t)},[]),e}const Qe=({rarityFilter:e,setRarityFilter:r})=>{const{width:t}=Ke(),{t:n}=je("rarity-filter"),o=t<768,s=c.useMemo(()=>a.jsxs(ie,{variant:"outline",type:"multiple",size:"sm",value:e,onValueChange:l=>r(l),className:`justify-end shadow-none border-2 border-slate-600 rounded-md ${o?"flex-col":"flex-row"}`,children:[a.jsx(x,{value:"◊","aria-label":"◊",className:"text-gray-400 hover:text-gray-500",children:"♢"}),a.jsx(x,{value:"◊◊","aria-label":"◊◊",className:"text-gray-400 hover:text-gray-500",children:"♢♢"}),a.jsx(x,{value:"◊◊◊","aria-label":"◊◊◊",className:"text-gray-400 hover:text-gray-500",children:"♢♢♢"}),a.jsx(x,{value:"◊◊◊◊","aria-label":"◊◊◊◊",className:"text-gray-400 hover:text-gray-500",children:"♢♢♢♢"}),a.jsx(x,{value:"☆","aria-label":"☆",className:"text-yellow-500 hover:text-yellow-600 .dark:data-[state=on]:text-yellow-500",children:"☆"}),a.jsx(x,{value:"☆☆","aria-label":"☆☆",className:"text-yellow-500 hover:text-yellow-600 data-[state=on]:text-yellow-500",children:"☆☆"}),a.jsx(x,{value:"☆☆☆","aria-label":"☆☆☆",className:"text-yellow-500 hover:text-yellow-600 data-[state=on]:text-yellow-500",children:"☆☆☆"}),a.jsx(x,{value:"Crown Rare","aria-label":"♛",children:"👑"})]}),[e,o]);return o?a.jsxs(Me,{children:[a.jsx(ze,{asChild:!0,children:a.jsxs(ye,{variant:"outline",children:[n("filters")," (",e.length,")"]})}),a.jsx(Q,{className:"w-32",children:s})]}):s};export{Qe as R,Ke as u};

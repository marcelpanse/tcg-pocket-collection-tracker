import{d as H,r as s,q as V,j as d,o as q,P as D,k as p,s as z,l as J,u as Q,t as W}from"./index-CkxF7y-l.js";var _="rovingFocusGroup.onEntryFocus",X={bubbles:!1,cancelable:!0},b="RovingFocusGroup",[h,G,Z]=V(b),[$,ie]=H(b,[Z]),[ee,te]=$(b),N=s.forwardRef((e,r)=>d.jsx(h.Provider,{scope:e.__scopeRovingFocusGroup,children:d.jsx(h.Slot,{scope:e.__scopeRovingFocusGroup,children:d.jsx(oe,{...e,ref:r})})}));N.displayName=b;var oe=s.forwardRef((e,r)=>{const{__scopeRovingFocusGroup:c,orientation:t,loop:F=!1,dir:g,currentTabStopId:R,defaultCurrentTabStopId:E,onCurrentTabStopIdChange:m,onEntryFocus:a,preventScrollOnEntryFocus:w=!1,...C}=e,v=s.useRef(null),I=z(r,v),o=J(g),[l=null,T]=Q({prop:R,defaultProp:E,onChange:m}),[u,i]=s.useState(!1),S=W(a),k=G(c),x=s.useRef(!1),[M,y]=s.useState(0);return s.useEffect(()=>{const n=v.current;if(n)return n.addEventListener(_,S),()=>n.removeEventListener(_,S)},[S]),d.jsx(ee,{scope:c,orientation:t,dir:o,loop:F,currentTabStopId:l,onItemFocus:s.useCallback(n=>T(n),[T]),onItemShiftTab:s.useCallback(()=>i(!0),[]),onFocusableItemAdd:s.useCallback(()=>y(n=>n+1),[]),onFocusableItemRemove:s.useCallback(()=>y(n=>n-1),[]),children:d.jsx(D.div,{tabIndex:u||M===0?-1:0,"data-orientation":t,...C,ref:I,style:{outline:"none",...e.style},onMouseDown:p(e.onMouseDown,()=>{x.current=!0}),onFocus:p(e.onFocus,n=>{const L=!x.current;if(n.target===n.currentTarget&&L&&!u){const P=new CustomEvent(_,X);if(n.currentTarget.dispatchEvent(P),!P.defaultPrevented){const A=k().filter(f=>f.focusable),U=A.find(f=>f.active),B=A.find(f=>f.id===l),Y=[U,B,...A].filter(Boolean).map(f=>f.ref.current);j(Y,w)}}x.current=!1}),onBlur:p(e.onBlur,()=>i(!1))})})}),O="RovingFocusGroupItem",K=s.forwardRef((e,r)=>{const{__scopeRovingFocusGroup:c,focusable:t=!0,active:F=!1,tabStopId:g,...R}=e,E=q(),m=g||E,a=te(O,c),w=a.currentTabStopId===m,C=G(c),{onFocusableItemAdd:v,onFocusableItemRemove:I}=a;return s.useEffect(()=>{if(t)return v(),()=>I()},[t,v,I]),d.jsx(h.ItemSlot,{scope:c,id:m,focusable:t,active:F,children:d.jsx(D.span,{tabIndex:w?0:-1,"data-orientation":a.orientation,...R,ref:r,onMouseDown:p(e.onMouseDown,o=>{t?a.onItemFocus(m):o.preventDefault()}),onFocus:p(e.onFocus,()=>a.onItemFocus(m)),onKeyDown:p(e.onKeyDown,o=>{if(o.key==="Tab"&&o.shiftKey){a.onItemShiftTab();return}if(o.target!==o.currentTarget)return;const l=se(o,a.orientation,a.dir);if(l!==void 0){if(o.metaKey||o.ctrlKey||o.altKey||o.shiftKey)return;o.preventDefault();let u=C().filter(i=>i.focusable).map(i=>i.ref.current);if(l==="last")u.reverse();else if(l==="prev"||l==="next"){l==="prev"&&u.reverse();const i=u.indexOf(o.currentTarget);u=a.loop?ce(u,i+1):u.slice(i+1)}setTimeout(()=>j(u))}})})})});K.displayName=O;var re={ArrowLeft:"prev",ArrowUp:"prev",ArrowRight:"next",ArrowDown:"next",PageUp:"first",Home:"first",PageDown:"last",End:"last"};function ne(e,r){return r!=="rtl"?e:e==="ArrowLeft"?"ArrowRight":e==="ArrowRight"?"ArrowLeft":e}function se(e,r,c){const t=ne(e.key,c);if(!(r==="vertical"&&["ArrowLeft","ArrowRight"].includes(t))&&!(r==="horizontal"&&["ArrowUp","ArrowDown"].includes(t)))return re[t]}function j(e,r=!1){const c=document.activeElement;for(const t of e)if(t===c||(t.focus({preventScroll:r}),document.activeElement!==c))return}function ce(e,r){return e.map((c,t)=>e[(r+t)%e.length])}var le=N,fe=K;export{fe as I,le as R,ie as c};

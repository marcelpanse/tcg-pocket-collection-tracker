import{R as A,r as R,j as m,f as He,a as ae,a5 as Jt,$ as Qt,W as Zt,H as er,e as tr,O as rr,a6 as sr,a7 as ir,U as ar,A as nr,u as or,a8 as we,D as lr,l as ur,m as cr,n as dr,I as Oe,B as nt,a9 as fr}from"./index-DyvL0NB1.js";import{A as hr,a as yr,b as mr}from"./alert-CRYlpLSk.js";import{S as gr}from"./siren-DClRwuq1.js";var _e=e=>e.type==="checkbox",ie=e=>e instanceof Date,U=e=>e==null;const vt=e=>typeof e=="object";var E=e=>!U(e)&&!Array.isArray(e)&&vt(e)&&!ie(e),xt=e=>E(e)&&e.target?_e(e.target)?e.target.checked:e.target.value:e,br=e=>e.substring(0,e.search(/\.\d+(\.|$)/))||e,_t=(e,r)=>e.has(br(r)),vr=e=>{const r=e.constructor&&e.constructor.prototype;return E(r)&&r.hasOwnProperty("isPrototypeOf")},qe=typeof window<"u"&&typeof window.HTMLElement<"u"&&typeof document<"u";function $(e){let r;const t=Array.isArray(e),i=typeof FileList<"u"?e instanceof FileList:!1;if(e instanceof Date)r=new Date(e);else if(e instanceof Set)r=new Set(e);else if(!(qe&&(e instanceof Blob||i))&&(t||E(e)))if(r=t?[]:{},!t&&!vr(e))r=e;else for(const a in e)e.hasOwnProperty(a)&&(r[a]=$(e[a]));else return e;return r}var Ce=e=>Array.isArray(e)?e.filter(Boolean):[],D=e=>e===void 0,f=(e,r,t)=>{if(!r||!E(e))return t;const i=Ce(r.split(/[,[\].]+?/)).reduce((a,o)=>U(a)?a:a[o],e);return D(i)||i===e?D(e[r])?t:e[r]:i},G=e=>typeof e=="boolean",We=e=>/^\w*$/.test(e),pt=e=>Ce(e.replace(/["|']|\]/g,"").split(/\.|\[/)),k=(e,r,t)=>{let i=-1;const a=We(r)?[r]:pt(r),o=a.length,u=o-1;for(;++i<o;){const d=a[i];let g=t;if(i!==u){const w=e[d];g=E(w)||Array.isArray(w)?w:isNaN(+a[i+1])?{}:[]}if(d==="__proto__"||d==="constructor"||d==="prototype")return;e[d]=g,e=e[d]}return e};const Ae={BLUR:"blur",FOCUS_OUT:"focusout",CHANGE:"change"},J={onBlur:"onBlur",onChange:"onChange",onSubmit:"onSubmit",onTouched:"onTouched",all:"all"},ee={max:"max",min:"min",maxLength:"maxLength",minLength:"minLength",pattern:"pattern",required:"required",validate:"validate"},Ft=A.createContext(null),je=()=>A.useContext(Ft),xr=e=>{const{children:r,...t}=e;return A.createElement(Ft.Provider,{value:t},r)};var wt=(e,r,t,i=!0)=>{const a={defaultValues:r._defaultValues};for(const o in e)Object.defineProperty(a,o,{get:()=>{const u=o;return r._proxyFormState[u]!==J.all&&(r._proxyFormState[u]=!i||J.all),t&&(t[u]=!0),e[u]}});return a},H=e=>E(e)&&!Object.keys(e).length,Vt=(e,r,t,i)=>{t(e);const{name:a,...o}=e;return H(o)||Object.keys(o).length>=Object.keys(r).length||Object.keys(o).find(u=>r[u]===(!i||J.all))},ve=e=>Array.isArray(e)?e:[e],kt=(e,r,t)=>!e||!r||e===r||ve(e).some(i=>i&&(t?i===r:i.startsWith(r)||r.startsWith(i)));function ze(e){const r=A.useRef(e);r.current=e,A.useEffect(()=>{const t=!e.disabled&&r.current.subject&&r.current.subject.subscribe({next:r.current.next});return()=>{t&&t.unsubscribe()}},[e.disabled])}function _r(e){const r=je(),{control:t=r.control,disabled:i,name:a,exact:o}=e||{},[u,d]=A.useState(t._formState),g=A.useRef(!0),w=A.useRef({isDirty:!1,isLoading:!1,dirtyFields:!1,touchedFields:!1,validatingFields:!1,isValidating:!1,isValid:!1,errors:!1}),x=A.useRef(a);return x.current=a,ze({disabled:i,next:b=>g.current&&kt(x.current,b.name,o)&&Vt(b,w.current,t._updateFormState)&&d({...t._formState,...b}),subject:t._subjects.state}),A.useEffect(()=>(g.current=!0,w.current.isValid&&t._updateValid(!0),()=>{g.current=!1}),[t]),A.useMemo(()=>wt(u,t,w.current,!1),[u,t])}var Z=e=>typeof e=="string",At=(e,r,t,i,a)=>Z(e)?(i&&r.watch.add(e),f(t,e,a)):Array.isArray(e)?e.map(o=>(i&&r.watch.add(o),f(t,o))):(i&&(r.watchAll=!0),t);function pr(e){const r=je(),{control:t=r.control,name:i,defaultValue:a,disabled:o,exact:u}=e||{},d=A.useRef(i);d.current=i,ze({disabled:o,subject:t._subjects.values,next:x=>{kt(d.current,x.name,u)&&w($(At(d.current,t._names,x.values||t._formValues,!1,a)))}});const[g,w]=A.useState(t._getWatch(i,a));return A.useEffect(()=>t._removeUnmounted()),g}function Fr(e){const r=je(),{name:t,disabled:i,control:a=r.control,shouldUnregister:o}=e,u=_t(a._names.array,t),d=pr({control:a,name:t,defaultValue:f(a._formValues,t,f(a._defaultValues,t,e.defaultValue)),exact:!0}),g=_r({control:a,name:t,exact:!0}),w=A.useRef(a.register(t,{...e.rules,value:d,...G(e.disabled)?{disabled:e.disabled}:{}})),x=A.useMemo(()=>Object.defineProperties({},{invalid:{enumerable:!0,get:()=>!!f(g.errors,t)},isDirty:{enumerable:!0,get:()=>!!f(g.dirtyFields,t)},isTouched:{enumerable:!0,get:()=>!!f(g.touchedFields,t)},isValidating:{enumerable:!0,get:()=>!!f(g.validatingFields,t)},error:{enumerable:!0,get:()=>f(g.errors,t)}}),[g,t]),b=A.useMemo(()=>({name:t,value:d,...G(i)||g.disabled?{disabled:g.disabled||i}:{},onChange:S=>w.current.onChange({target:{value:xt(S),name:t},type:Ae.CHANGE}),onBlur:()=>w.current.onBlur({target:{value:f(a._formValues,t),name:t},type:Ae.BLUR}),ref:S=>{const W=f(a._fields,t);W&&S&&(W._f.ref={focus:()=>S.focus(),select:()=>S.select(),setCustomValidity:T=>S.setCustomValidity(T),reportValidity:()=>S.reportValidity()})}}),[t,a._formValues,i,g.disabled,d,a._fields]);return A.useEffect(()=>{const S=a._options.shouldUnregister||o,W=(T,C)=>{const L=f(a._fields,T);L&&L._f&&(L._f.mount=C)};if(W(t,!0),S){const T=$(f(a._options.defaultValues,t));k(a._defaultValues,t,T),D(f(a._formValues,t))&&k(a._formValues,t,T)}return!u&&a.register(t),()=>{(u?S&&!a._state.action:S)?a.unregister(t):W(t,!1)}},[t,a,u,o]),A.useEffect(()=>{a._updateDisabledField({disabled:i,fields:a._fields,name:t})},[i,t,a]),A.useMemo(()=>({field:b,formState:g,fieldState:x}),[b,g,x])}const wr=e=>e.render(Fr(e));var St=(e,r,t,i,a)=>r?{...t[e],types:{...t[e]&&t[e].types?t[e].types:{},[i]:a||!0}}:{},ot=e=>({isOnSubmit:!e||e===J.onSubmit,isOnBlur:e===J.onBlur,isOnChange:e===J.onChange,isOnAll:e===J.all,isOnTouch:e===J.onTouched}),lt=(e,r,t)=>!t&&(r.watchAll||r.watch.has(e)||[...r.watch].some(i=>e.startsWith(i)&&/^\.\w+/.test(e.slice(i.length))));const xe=(e,r,t,i)=>{for(const a of t||Object.keys(e)){const o=f(e,a);if(o){const{_f:u,...d}=o;if(u){if(u.refs&&u.refs[0]&&r(u.refs[0],a)&&!i)return!0;if(u.ref&&r(u.ref,u.name)&&!i)return!0;if(xe(d,r))break}else if(E(d)&&xe(d,r))break}}};var Vr=(e,r,t)=>{const i=ve(f(e,t));return k(i,"root",r[t]),k(e,t,i),e},Ke=e=>e.type==="file",Q=e=>typeof e=="function",Se=e=>{if(!qe)return!1;const r=e?e.ownerDocument:0;return e instanceof(r&&r.defaultView?r.defaultView.HTMLElement:HTMLElement)},ke=e=>Z(e),Ge=e=>e.type==="radio",De=e=>e instanceof RegExp;const ut={value:!1,isValid:!1},ct={value:!0,isValid:!0};var Dt=e=>{if(Array.isArray(e)){if(e.length>1){const r=e.filter(t=>t&&t.checked&&!t.disabled).map(t=>t.value);return{value:r,isValid:!!r.length}}return e[0].checked&&!e[0].disabled?e[0].attributes&&!D(e[0].attributes.value)?D(e[0].value)||e[0].value===""?ct:{value:e[0].value,isValid:!0}:ct:ut}return ut};const dt={isValid:!1,value:null};var Et=e=>Array.isArray(e)?e.reduce((r,t)=>t&&t.checked&&!t.disabled?{isValid:!0,value:t.value}:r,dt):dt;function ft(e,r,t="validate"){if(ke(e)||Array.isArray(e)&&e.every(ke)||G(e)&&!e)return{type:t,message:ke(e)?e:"",ref:r}}var le=e=>E(e)&&!De(e)?e:{value:e,message:""},ht=async(e,r,t,i,a,o)=>{const{ref:u,refs:d,required:g,maxLength:w,minLength:x,min:b,max:S,pattern:W,validate:T,name:C,valueAsNumber:L,mount:q}=e._f,F=f(t,C);if(!q||r.has(C))return{};const B=d?d[0]:u,X=p=>{a&&B.reportValidity&&(B.setCustomValidity(G(p)?"":p||""),B.reportValidity())},j={},ne=Ge(u),pe=_e(u),se=ne||pe,oe=(L||Ke(u))&&D(u.value)&&D(F)||Se(u)&&u.value===""||F===""||Array.isArray(F)&&!F.length,z=St.bind(null,C,i,j),Fe=(p,V,N,M=ee.maxLength,Y=ee.minLength)=>{const K=p?V:N;j[C]={type:p?M:Y,message:K,ref:u,...z(p?M:Y,K)}};if(o?!Array.isArray(F)||!F.length:g&&(!se&&(oe||U(F))||G(F)&&!F||pe&&!Dt(d).isValid||ne&&!Et(d).isValid)){const{value:p,message:V}=ke(g)?{value:!!g,message:g}:le(g);if(p&&(j[C]={type:ee.required,message:V,ref:B,...z(ee.required,V)},!i))return X(V),j}if(!oe&&(!U(b)||!U(S))){let p,V;const N=le(S),M=le(b);if(!U(F)&&!isNaN(F)){const Y=u.valueAsNumber||F&&+F;U(N.value)||(p=Y>N.value),U(M.value)||(V=Y<M.value)}else{const Y=u.valueAsDate||new Date(F),K=de=>new Date(new Date().toDateString()+" "+de),ue=u.type=="time",ce=u.type=="week";Z(N.value)&&F&&(p=ue?K(F)>K(N.value):ce?F>N.value:Y>new Date(N.value)),Z(M.value)&&F&&(V=ue?K(F)<K(M.value):ce?F<M.value:Y<new Date(M.value))}if((p||V)&&(Fe(!!p,N.message,M.message,ee.max,ee.min),!i))return X(j[C].message),j}if((w||x)&&!oe&&(Z(F)||o&&Array.isArray(F))){const p=le(w),V=le(x),N=!U(p.value)&&F.length>+p.value,M=!U(V.value)&&F.length<+V.value;if((N||M)&&(Fe(N,p.message,V.message),!i))return X(j[C].message),j}if(W&&!oe&&Z(F)){const{value:p,message:V}=le(W);if(De(p)&&!F.match(p)&&(j[C]={type:ee.pattern,message:V,ref:u,...z(ee.pattern,V)},!i))return X(V),j}if(T){if(Q(T)){const p=await T(F,t),V=ft(p,B);if(V&&(j[C]={...V,...z(ee.validate,V.message)},!i))return X(V.message),j}else if(E(T)){let p={};for(const V in T){if(!H(p)&&!i)break;const N=ft(await T[V](F,t),B,V);N&&(p={...N,...z(V,N.message)},X(N.message),i&&(j[C]=p))}if(!H(p)&&(j[C]={ref:B,...p},!i))return j}}return X(!0),j};function kr(e,r){const t=r.slice(0,-1).length;let i=0;for(;i<t;)e=D(e)?i++:e[r[i++]];return e}function Ar(e){for(const r in e)if(e.hasOwnProperty(r)&&!D(e[r]))return!1;return!0}function P(e,r){const t=Array.isArray(r)?r:We(r)?[r]:pt(r),i=t.length===1?e:kr(e,t),a=t.length-1,o=t[a];return i&&delete i[o],a!==0&&(E(i)&&H(i)||Array.isArray(i)&&Ar(i))&&P(e,t.slice(0,-1)),e}var Le=()=>{let e=[];return{get observers(){return e},next:a=>{for(const o of e)o.next&&o.next(a)},subscribe:a=>(e.push(a),{unsubscribe:()=>{e=e.filter(o=>o!==a)}}),unsubscribe:()=>{e=[]}}},Be=e=>U(e)||!vt(e);function re(e,r){if(Be(e)||Be(r))return e===r;if(ie(e)&&ie(r))return e.getTime()===r.getTime();const t=Object.keys(e),i=Object.keys(r);if(t.length!==i.length)return!1;for(const a of t){const o=e[a];if(!i.includes(a))return!1;if(a!=="ref"){const u=r[a];if(ie(o)&&ie(u)||E(o)&&E(u)||Array.isArray(o)&&Array.isArray(u)?!re(o,u):o!==u)return!1}}return!0}var Ct=e=>e.type==="select-multiple",Sr=e=>Ge(e)||_e(e),Me=e=>Se(e)&&e.isConnected,jt=e=>{for(const r in e)if(Q(e[r]))return!0;return!1};function Ee(e,r={}){const t=Array.isArray(e);if(E(e)||t)for(const i in e)Array.isArray(e[i])||E(e[i])&&!jt(e[i])?(r[i]=Array.isArray(e[i])?[]:{},Ee(e[i],r[i])):U(e[i])||(r[i]=!0);return r}function Nt(e,r,t){const i=Array.isArray(e);if(E(e)||i)for(const a in e)Array.isArray(e[a])||E(e[a])&&!jt(e[a])?D(r)||Be(t[a])?t[a]=Array.isArray(e[a])?Ee(e[a],[]):{...Ee(e[a])}:Nt(e[a],U(r)?{}:r[a],t[a]):t[a]=!re(e[a],r[a]);return t}var fe=(e,r)=>Nt(e,r,Ee(r)),Pt=(e,{valueAsNumber:r,valueAsDate:t,setValueAs:i})=>D(e)?e:r?e===""?NaN:e&&+e:t&&Z(e)?new Date(e):i?i(e):e;function Ue(e){const r=e.ref;return Ke(r)?r.files:Ge(r)?Et(e.refs).value:Ct(r)?[...r.selectedOptions].map(({value:t})=>t):_e(r)?Dt(e.refs).value:Pt(D(r.value)?e.ref.value:r.value,e)}var Dr=(e,r,t,i)=>{const a={};for(const o of e){const u=f(r,o);u&&k(a,o,u._f)}return{criteriaMode:t,names:[...e],fields:a,shouldUseNativeValidation:i}},he=e=>D(e)?e:De(e)?e.source:E(e)?De(e.value)?e.value.source:e.value:e;const yt="AsyncFunction";var Er=e=>!!e&&!!e.validate&&!!(Q(e.validate)&&e.validate.constructor.name===yt||E(e.validate)&&Object.values(e.validate).find(r=>r.constructor.name===yt)),Cr=e=>e.mount&&(e.required||e.min||e.max||e.maxLength||e.minLength||e.pattern||e.validate);function mt(e,r,t){const i=f(e,t);if(i||We(t))return{error:i,name:t};const a=t.split(".");for(;a.length;){const o=a.join("."),u=f(r,o),d=f(e,o);if(u&&!Array.isArray(u)&&t!==o)return{name:t};if(d&&d.type)return{name:o,error:d};a.pop()}return{name:t}}var jr=(e,r,t,i,a)=>a.isOnAll?!1:!t&&a.isOnTouch?!(r||e):(t?i.isOnBlur:a.isOnBlur)?!e:(t?i.isOnChange:a.isOnChange)?e:!0,Nr=(e,r)=>!Ce(f(e,r)).length&&P(e,r);const Pr={mode:J.onSubmit,reValidateMode:J.onChange,shouldFocusError:!0};function Rr(e={}){let r={...Pr,...e},t={submitCount:0,isDirty:!1,isLoading:Q(r.defaultValues),isValidating:!1,isSubmitted:!1,isSubmitting:!1,isSubmitSuccessful:!1,isValid:!1,touchedFields:{},dirtyFields:{},validatingFields:{},errors:r.errors||{},disabled:r.disabled||!1},i={},a=E(r.defaultValues)||E(r.values)?$(r.defaultValues||r.values)||{}:{},o=r.shouldUnregister?{}:$(a),u={action:!1,mount:!1,watch:!1},d={mount:new Set,disabled:new Set,unMount:new Set,array:new Set,watch:new Set},g,w=0;const x={isDirty:!1,dirtyFields:!1,validatingFields:!1,touchedFields:!1,isValidating:!1,isValid:!1,errors:!1},b={values:Le(),array:Le(),state:Le()},S=ot(r.mode),W=ot(r.reValidateMode),T=r.criteriaMode===J.all,C=s=>n=>{clearTimeout(w),w=setTimeout(s,n)},L=async s=>{if(!r.disabled&&(x.isValid||s)){const n=r.resolver?H((await se()).errors):await z(i,!0);n!==t.isValid&&b.state.next({isValid:n})}},q=(s,n)=>{!r.disabled&&(x.isValidating||x.validatingFields)&&((s||Array.from(d.mount)).forEach(l=>{l&&(n?k(t.validatingFields,l,n):P(t.validatingFields,l))}),b.state.next({validatingFields:t.validatingFields,isValidating:!H(t.validatingFields)}))},F=(s,n=[],l,y,h=!0,c=!0)=>{if(y&&l&&!r.disabled){if(u.action=!0,c&&Array.isArray(f(i,s))){const v=l(f(i,s),y.argA,y.argB);h&&k(i,s,v)}if(c&&Array.isArray(f(t.errors,s))){const v=l(f(t.errors,s),y.argA,y.argB);h&&k(t.errors,s,v),Nr(t.errors,s)}if(x.touchedFields&&c&&Array.isArray(f(t.touchedFields,s))){const v=l(f(t.touchedFields,s),y.argA,y.argB);h&&k(t.touchedFields,s,v)}x.dirtyFields&&(t.dirtyFields=fe(a,o)),b.state.next({name:s,isDirty:p(s,n),dirtyFields:t.dirtyFields,errors:t.errors,isValid:t.isValid})}else k(o,s,n)},B=(s,n)=>{k(t.errors,s,n),b.state.next({errors:t.errors})},X=s=>{t.errors=s,b.state.next({errors:t.errors,isValid:!1})},j=(s,n,l,y)=>{const h=f(i,s);if(h){const c=f(o,s,D(l)?f(a,s):l);D(c)||y&&y.defaultChecked||n?k(o,s,n?c:Ue(h._f)):M(s,c),u.mount&&L()}},ne=(s,n,l,y,h)=>{let c=!1,v=!1;const _={name:s};if(!r.disabled){const I=!!(f(i,s)&&f(i,s)._f&&f(i,s)._f.disabled);if(!l||y){x.isDirty&&(v=t.isDirty,t.isDirty=_.isDirty=p(),c=v!==_.isDirty);const O=I||re(f(a,s),n);v=!!(!I&&f(t.dirtyFields,s)),O||I?P(t.dirtyFields,s):k(t.dirtyFields,s,!0),_.dirtyFields=t.dirtyFields,c=c||x.dirtyFields&&v!==!O}if(l){const O=f(t.touchedFields,s);O||(k(t.touchedFields,s,l),_.touchedFields=t.touchedFields,c=c||x.touchedFields&&O!==l)}c&&h&&b.state.next(_)}return c?_:{}},pe=(s,n,l,y)=>{const h=f(t.errors,s),c=x.isValid&&G(n)&&t.isValid!==n;if(r.delayError&&l?(g=C(()=>B(s,l)),g(r.delayError)):(clearTimeout(w),g=null,l?k(t.errors,s,l):P(t.errors,s)),(l?!re(h,l):h)||!H(y)||c){const v={...y,...c&&G(n)?{isValid:n}:{},errors:t.errors,name:s};t={...t,...v},b.state.next(v)}},se=async s=>{q(s,!0);const n=await r.resolver(o,r.context,Dr(s||d.mount,i,r.criteriaMode,r.shouldUseNativeValidation));return q(s),n},oe=async s=>{const{errors:n}=await se(s);if(s)for(const l of s){const y=f(n,l);y?k(t.errors,l,y):P(t.errors,l)}else t.errors=n;return n},z=async(s,n,l={valid:!0})=>{for(const y in s){const h=s[y];if(h){const{_f:c,...v}=h;if(c){const _=d.array.has(c.name),I=h._f&&Er(h._f);I&&x.validatingFields&&q([y],!0);const O=await ht(h,d.disabled,o,T,r.shouldUseNativeValidation&&!n,_);if(I&&x.validatingFields&&q([y]),O[c.name]&&(l.valid=!1,n))break;!n&&(f(O,c.name)?_?Vr(t.errors,O,c.name):k(t.errors,c.name,O[c.name]):P(t.errors,c.name))}!H(v)&&await z(v,n,l)}}return l.valid},Fe=()=>{for(const s of d.unMount){const n=f(i,s);n&&(n._f.refs?n._f.refs.every(l=>!Me(l)):!Me(n._f.ref))&&Pe(s)}d.unMount=new Set},p=(s,n)=>!r.disabled&&(s&&n&&k(o,s,n),!re(Ye(),a)),V=(s,n,l)=>At(s,d,{...u.mount?o:D(n)?a:Z(s)?{[s]:n}:n},l,n),N=s=>Ce(f(u.mount?o:a,s,r.shouldUnregister?f(a,s,[]):[])),M=(s,n,l={})=>{const y=f(i,s);let h=n;if(y){const c=y._f;c&&(!c.disabled&&k(o,s,Pt(n,c)),h=Se(c.ref)&&U(n)?"":n,Ct(c.ref)?[...c.ref.options].forEach(v=>v.selected=h.includes(v.value)):c.refs?_e(c.ref)?c.refs.length>1?c.refs.forEach(v=>(!v.defaultChecked||!v.disabled)&&(v.checked=Array.isArray(h)?!!h.find(_=>_===v.value):h===v.value)):c.refs[0]&&(c.refs[0].checked=!!h):c.refs.forEach(v=>v.checked=v.value===h):Ke(c.ref)?c.ref.value="":(c.ref.value=h,c.ref.type||b.values.next({name:s,values:{...o}})))}(l.shouldDirty||l.shouldTouch)&&ne(s,h,l.shouldTouch,l.shouldDirty,!0),l.shouldValidate&&de(s)},Y=(s,n,l)=>{for(const y in n){const h=n[y],c=`${s}.${y}`,v=f(i,c);(d.array.has(s)||E(h)||v&&!v._f)&&!ie(h)?Y(c,h,l):M(c,h,l)}},K=(s,n,l={})=>{const y=f(i,s),h=d.array.has(s),c=$(n);k(o,s,c),h?(b.array.next({name:s,values:{...o}}),(x.isDirty||x.dirtyFields)&&l.shouldDirty&&b.state.next({name:s,dirtyFields:fe(a,o),isDirty:p(s,c)})):y&&!y._f&&!U(c)?Y(s,c,l):M(s,c,l),lt(s,d)&&b.state.next({...t}),b.values.next({name:u.mount?s:void 0,values:{...o}})},ue=async s=>{u.mount=!0;const n=s.target;let l=n.name,y=!0;const h=f(i,l),c=()=>n.type?Ue(h._f):xt(s),v=_=>{y=Number.isNaN(_)||ie(_)&&isNaN(_.getTime())||re(_,f(o,l,_))};if(h){let _,I;const O=c(),te=s.type===Ae.BLUR||s.type===Ae.FOCUS_OUT,Gt=!Cr(h._f)&&!r.resolver&&!f(t.errors,l)&&!h._f.deps||jr(te,f(t.touchedFields,l),t.isSubmitted,W,S),Te=lt(l,d,te);k(o,l,O),te?(h._f.onBlur&&h._f.onBlur(s),g&&g(0)):h._f.onChange&&h._f.onChange(s);const Ie=ne(l,O,te,!1),Xt=!H(Ie)||Te;if(!te&&b.values.next({name:l,type:s.type,values:{...o}}),Gt)return x.isValid&&(r.mode==="onBlur"&&te?L():te||L()),Xt&&b.state.next({name:l,...Te?{}:Ie});if(!te&&Te&&b.state.next({...t}),r.resolver){const{errors:it}=await se([l]);if(v(O),y){const Yt=mt(t.errors,i,l),at=mt(it,i,Yt.name||l);_=at.error,l=at.name,I=H(it)}}else q([l],!0),_=(await ht(h,d.disabled,o,T,r.shouldUseNativeValidation))[l],q([l]),v(O),y&&(_?I=!1:x.isValid&&(I=await z(i,!0)));y&&(h._f.deps&&de(h._f.deps),pe(l,I,_,Ie))}},ce=(s,n)=>{if(f(t.errors,n)&&s.focus)return s.focus(),1},de=async(s,n={})=>{let l,y;const h=ve(s);if(r.resolver){const c=await oe(D(s)?s:h);l=H(c),y=s?!h.some(v=>f(c,v)):l}else s?(y=(await Promise.all(h.map(async c=>{const v=f(i,c);return await z(v&&v._f?{[c]:v}:v)}))).every(Boolean),!(!y&&!t.isValid)&&L()):y=l=await z(i);return b.state.next({...!Z(s)||x.isValid&&l!==t.isValid?{}:{name:s},...r.resolver||!s?{isValid:l}:{},errors:t.errors}),n.shouldFocus&&!y&&xe(i,ce,s?h:d.mount),y},Ye=s=>{const n={...u.mount?o:a};return D(s)?n:Z(s)?f(n,s):s.map(l=>f(n,l))},Je=(s,n)=>({invalid:!!f((n||t).errors,s),isDirty:!!f((n||t).dirtyFields,s),error:f((n||t).errors,s),isValidating:!!f(t.validatingFields,s),isTouched:!!f((n||t).touchedFields,s)}),qt=s=>{s&&ve(s).forEach(n=>P(t.errors,n)),b.state.next({errors:s?t.errors:{}})},Qe=(s,n,l)=>{const y=(f(i,s,{_f:{}})._f||{}).ref,h=f(t.errors,s)||{},{ref:c,message:v,type:_,...I}=h;k(t.errors,s,{...I,...n,ref:y}),b.state.next({name:s,errors:t.errors,isValid:!1}),l&&l.shouldFocus&&y&&y.focus&&y.focus()},Wt=(s,n)=>Q(s)?b.values.subscribe({next:l=>s(V(void 0,n),l)}):V(s,n,!0),Pe=(s,n={})=>{for(const l of s?ve(s):d.mount)d.mount.delete(l),d.array.delete(l),n.keepValue||(P(i,l),P(o,l)),!n.keepError&&P(t.errors,l),!n.keepDirty&&P(t.dirtyFields,l),!n.keepTouched&&P(t.touchedFields,l),!n.keepIsValidating&&P(t.validatingFields,l),!r.shouldUnregister&&!n.keepDefaultValue&&P(a,l);b.values.next({values:{...o}}),b.state.next({...t,...n.keepDirty?{isDirty:p()}:{}}),!n.keepIsValid&&L()},Ze=({disabled:s,name:n,field:l,fields:y})=>{(G(s)&&u.mount||s||d.disabled.has(n))&&(s?d.disabled.add(n):d.disabled.delete(n),ne(n,Ue(l?l._f:f(y,n)._f),!1,!1,!0))},Re=(s,n={})=>{let l=f(i,s);const y=G(n.disabled)||G(r.disabled);return k(i,s,{...l||{},_f:{...l&&l._f?l._f:{ref:{name:s}},name:s,mount:!0,...n}}),d.mount.add(s),l?Ze({field:l,disabled:G(n.disabled)?n.disabled:r.disabled,name:s}):j(s,!0,n.value),{...y?{disabled:n.disabled||r.disabled}:{},...r.progressive?{required:!!n.required,min:he(n.min),max:he(n.max),minLength:he(n.minLength),maxLength:he(n.maxLength),pattern:he(n.pattern)}:{},name:s,onChange:ue,onBlur:ue,ref:h=>{if(h){Re(s,n),l=f(i,s);const c=D(h.value)&&h.querySelectorAll&&h.querySelectorAll("input,select,textarea")[0]||h,v=Sr(c),_=l._f.refs||[];if(v?_.find(I=>I===c):c===l._f.ref)return;k(i,s,{_f:{...l._f,...v?{refs:[..._.filter(Me),c,...Array.isArray(f(a,s))?[{}]:[]],ref:{type:c.type,name:s}}:{ref:c}}}),j(s,!1,void 0,c)}else l=f(i,s,{}),l._f&&(l._f.mount=!1),(r.shouldUnregister||n.shouldUnregister)&&!(_t(d.array,s)&&u.action)&&d.unMount.add(s)}}},et=()=>r.shouldFocusError&&xe(i,ce,d.mount),zt=s=>{G(s)&&(b.state.next({disabled:s}),xe(i,(n,l)=>{const y=f(i,l);y&&(n.disabled=y._f.disabled||s,Array.isArray(y._f.refs)&&y._f.refs.forEach(h=>{h.disabled=y._f.disabled||s}))},0,!1))},tt=(s,n)=>async l=>{let y;l&&(l.preventDefault&&l.preventDefault(),l.persist&&l.persist());let h=$(o);if(d.disabled.size)for(const c of d.disabled)k(h,c,void 0);if(b.state.next({isSubmitting:!0}),r.resolver){const{errors:c,values:v}=await se();t.errors=c,h=v}else await z(i);if(P(t.errors,"root"),H(t.errors)){b.state.next({errors:{}});try{await s(h,l)}catch(c){y=c}}else n&&await n({...t.errors},l),et(),setTimeout(et);if(b.state.next({isSubmitted:!0,isSubmitting:!1,isSubmitSuccessful:H(t.errors)&&!y,submitCount:t.submitCount+1,errors:t.errors}),y)throw y},Kt=(s,n={})=>{f(i,s)&&(D(n.defaultValue)?K(s,$(f(a,s))):(K(s,n.defaultValue),k(a,s,$(n.defaultValue))),n.keepTouched||P(t.touchedFields,s),n.keepDirty||(P(t.dirtyFields,s),t.isDirty=n.defaultValue?p(s,$(f(a,s))):p()),n.keepError||(P(t.errors,s),x.isValid&&L()),b.state.next({...t}))},rt=(s,n={})=>{const l=s?$(s):a,y=$(l),h=H(s),c=h?a:y;if(n.keepDefaultValues||(a=l),!n.keepValues){if(n.keepDirtyValues){const v=new Set([...d.mount,...Object.keys(fe(a,o))]);for(const _ of Array.from(v))f(t.dirtyFields,_)?k(c,_,f(o,_)):K(_,f(c,_))}else{if(qe&&D(s))for(const v of d.mount){const _=f(i,v);if(_&&_._f){const I=Array.isArray(_._f.refs)?_._f.refs[0]:_._f.ref;if(Se(I)){const O=I.closest("form");if(O){O.reset();break}}}}i={}}o=r.shouldUnregister?n.keepDefaultValues?$(a):{}:$(c),b.array.next({values:{...c}}),b.values.next({values:{...c}})}d={mount:n.keepDirtyValues?d.mount:new Set,unMount:new Set,array:new Set,disabled:new Set,watch:new Set,watchAll:!1,focus:""},u.mount=!x.isValid||!!n.keepIsValid||!!n.keepDirtyValues,u.watch=!!r.shouldUnregister,b.state.next({submitCount:n.keepSubmitCount?t.submitCount:0,isDirty:h?!1:n.keepDirty?t.isDirty:!!(n.keepDefaultValues&&!re(s,a)),isSubmitted:n.keepIsSubmitted?t.isSubmitted:!1,dirtyFields:h?{}:n.keepDirtyValues?n.keepDefaultValues&&o?fe(a,o):t.dirtyFields:n.keepDefaultValues&&s?fe(a,s):n.keepDirty?t.dirtyFields:{},touchedFields:n.keepTouched?t.touchedFields:{},errors:n.keepErrors?t.errors:{},isSubmitSuccessful:n.keepIsSubmitSuccessful?t.isSubmitSuccessful:!1,isSubmitting:!1})},st=(s,n)=>rt(Q(s)?s(o):s,n);return{control:{register:Re,unregister:Pe,getFieldState:Je,handleSubmit:tt,setError:Qe,_executeSchema:se,_getWatch:V,_getDirty:p,_updateValid:L,_removeUnmounted:Fe,_updateFieldArray:F,_updateDisabledField:Ze,_getFieldArray:N,_reset:rt,_resetDefaultValues:()=>Q(r.defaultValues)&&r.defaultValues().then(s=>{st(s,r.resetOptions),b.state.next({isLoading:!1})}),_updateFormState:s=>{t={...t,...s}},_disableForm:zt,_subjects:b,_proxyFormState:x,_setErrors:X,get _fields(){return i},get _formValues(){return o},get _state(){return u},set _state(s){u=s},get _defaultValues(){return a},get _names(){return d},set _names(s){d=s},get _formState(){return t},set _formState(s){t=s},get _options(){return r},set _options(s){r={...r,...s}}},trigger:de,register:Re,handleSubmit:tt,watch:Wt,setValue:K,getValues:Ye,reset:st,resetField:Kt,clearErrors:qt,unregister:Pe,setError:Qe,setFocus:(s,n={})=>{const l=f(i,s),y=l&&l._f;if(y){const h=y.refs?y.refs[0]:y.ref;h.focus&&(h.focus(),n.shouldSelect&&Q(h.select)&&h.select())}},getFieldState:Je}}function Tr(e={}){const r=A.useRef(void 0),t=A.useRef(void 0),[i,a]=A.useState({isDirty:!1,isValidating:!1,isLoading:Q(e.defaultValues),isSubmitted:!1,isSubmitting:!1,isSubmitSuccessful:!1,isValid:!1,submitCount:0,dirtyFields:{},touchedFields:{},validatingFields:{},errors:e.errors||{},disabled:e.disabled||!1,defaultValues:Q(e.defaultValues)?void 0:e.defaultValues});r.current||(r.current={...Rr(e),formState:i});const o=r.current.control;return o._options=e,ze({subject:o._subjects.state,next:u=>{Vt(u,o._proxyFormState,o._updateFormState,!0)&&a({...o._formState})}}),A.useEffect(()=>o._disableForm(e.disabled),[o,e.disabled]),A.useEffect(()=>{if(o._proxyFormState.isDirty){const u=o._getDirty();u!==i.isDirty&&o._subjects.state.next({isDirty:u})}},[o,i.isDirty]),A.useEffect(()=>{e.values&&!re(e.values,t.current)?(o._reset(e.values,o._options.resetOptions),t.current=e.values,a(u=>({...u}))):o._resetDefaultValues()},[e.values,o]),A.useEffect(()=>{e.errors&&o._setErrors(e.errors)},[e.errors,o]),A.useEffect(()=>{o._state.mount||(o._updateValid(),o._state.mount=!0),o._state.watch&&(o._state.watch=!1,o._subjects.state.next({...o._formState})),o._removeUnmounted()}),A.useEffect(()=>{e.shouldUnregister&&o._subjects.values.next({values:o._getWatch()})},[e.shouldUnregister,o]),r.current.formState=wt(i,o),r.current}var Ir="Label",Rt=R.forwardRef((e,r)=>m.jsx(He.label,{...e,ref:r,onMouseDown:t=>{var a;t.target.closest("button, input, select, textarea")||((a=e.onMouseDown)==null||a.call(e,t),!t.defaultPrevented&&t.detail>1&&t.preventDefault())}}));Rt.displayName=Ir;var Tt=Rt;const Or=Jt("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"),It=R.forwardRef(({className:e,...r},t)=>m.jsx(Tt,{ref:t,className:ae(Or(),e),...r}));It.displayName=Tt.displayName;const Lr=xr,Ot=R.createContext({}),Ve=({...e})=>m.jsx(Ot.Provider,{value:{name:e.name},children:m.jsx(wr,{...e})}),Ne=()=>{const e=R.useContext(Ot),r=R.useContext(Lt),{getFieldState:t,formState:i}=je(),a=t(e.name,i);if(!e)throw new Error("useFormField should be used within <FormField>");const{id:o}=r;return{id:o,name:e.name,formItemId:`${o}-form-item`,formDescriptionId:`${o}-form-item-description`,formMessageId:`${o}-form-item-message`,...a}},Lt=R.createContext({}),ye=R.forwardRef(({className:e,...r},t)=>{const i=R.useId();return m.jsx(Lt.Provider,{value:{id:i},children:m.jsx("div",{ref:t,className:ae("space-y-2",e),...r})})});ye.displayName="FormItem";const me=R.forwardRef(({className:e,...r},t)=>{const{error:i,formItemId:a}=Ne();return m.jsx(It,{ref:t,className:ae(i&&"text-red-500 dark:text-red-900",e),htmlFor:a,...r})});me.displayName="FormLabel";const ge=R.forwardRef(({...e},r)=>{const{error:t,formItemId:i,formDescriptionId:a,formMessageId:o}=Ne();return m.jsx(Qt,{ref:r,id:i,"aria-describedby":t?`${a} ${o}`:`${a}`,"aria-invalid":!!t,...e})});ge.displayName="FormControl";const be=R.forwardRef(({className:e,...r},t)=>{const{formDescriptionId:i}=Ne();return m.jsx("p",{ref:t,id:i,className:ae("text-[0.8rem] text-neutral-500 dark:text-neutral-400",e),...r})});be.displayName="FormDescription";const $e=R.forwardRef(({className:e,children:r,...t},i)=>{const{error:a,formMessageId:o}=Ne(),u=a?String(a==null?void 0:a.message):r;return u?m.jsx("p",{ref:i,id:o,className:ae("text-[0.8rem] font-medium text-red-500 dark:text-red-900",e),...t,children:u}):null});$e.displayName="FormMessage";var Xe="Switch",[Mr,rs]=tr(Xe),[Ur,Br]=Mr(Xe),Mt=R.forwardRef((e,r)=>{const{__scopeSwitch:t,name:i,checked:a,defaultChecked:o,required:u,disabled:d,value:g="on",onCheckedChange:w,form:x,...b}=e,[S,W]=R.useState(null),T=Zt(r,B=>W(B)),C=R.useRef(!1),L=S?x||!!S.closest("form"):!0,[q=!1,F]=er({prop:a,defaultProp:o,onChange:w});return m.jsxs(Ur,{scope:t,checked:q,disabled:d,children:[m.jsx(He.button,{type:"button",role:"switch","aria-checked":q,"aria-required":u,"data-state":$t(q),"data-disabled":d?"":void 0,disabled:d,value:g,...b,ref:T,onClick:rr(e.onClick,B=>{F(X=>!X),L&&(C.current=B.isPropagationStopped(),C.current||B.stopPropagation())})}),L&&m.jsx($r,{control:S,bubbles:!C.current,name:i,value:g,checked:q,required:u,disabled:d,form:x,style:{transform:"translateX(-100%)"}})]})});Mt.displayName=Xe;var Ut="SwitchThumb",Bt=R.forwardRef((e,r)=>{const{__scopeSwitch:t,...i}=e,a=Br(Ut,t);return m.jsx(He.span,{"data-state":$t(a.checked),"data-disabled":a.disabled?"":void 0,...i,ref:r})});Bt.displayName=Ut;var $r=e=>{const{control:r,checked:t,bubbles:i=!0,...a}=e,o=R.useRef(null),u=sr(t),d=ir(r);return R.useEffect(()=>{const g=o.current,w=window.HTMLInputElement.prototype,b=Object.getOwnPropertyDescriptor(w,"checked").set;if(u!==t&&b){const S=new Event("click",{bubbles:i});b.call(g,t),g.dispatchEvent(S)}},[u,t,i]),m.jsx("input",{type:"checkbox","aria-hidden":!0,defaultChecked:t,...a,tabIndex:-1,ref:o,style:{...e.style,...d,position:"absolute",pointerEvents:"none",opacity:0,margin:0}})};function $t(e){return e?"checked":"unchecked"}var Hr=Mt,qr=Bt;function Wr({className:e,...r}){return m.jsx(Hr,{"data-slot":"switch",className:ae("peer data-[state=checked]:bg-neutral-900 data-[state=unchecked]:bg-neutral-200 focus-visible:border-neutral-950 focus-visible:ring-neutral-950/50 dark:data-[state=unchecked]:bg-neutral-200/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-neutral-200 border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 dark:data-[state=checked]:bg-neutral-400 dark:data-[state=unchecked]:bg-neutral-500 dark:focus-visible:border-neutral-300 dark:focus-visible:ring-neutral-300/50 dark:dark:data-[state=unchecked]:bg-neutral-800/80 dark:border-neutral-800",e),...r,children:m.jsx(qr,{"data-slot":"switch-thumb",className:ae("bg-white dark:data-[state=unchecked]:bg-neutral-700 dark:data-[state=checked]:bg-neutral-50 pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 dark:bg-neutral-950 dark:dark:data-[state=unchecked]:bg-neutral-50 dark:dark:data-[state=checked]:bg-neutral-900")})})}const gt=(e,r,t)=>{if(e&&"reportValidity"in e){const i=f(t,r);e.setCustomValidity(i&&i.message||""),e.reportValidity()}},Ht=(e,r)=>{for(const t in r.fields){const i=r.fields[t];i&&i.ref&&"reportValidity"in i.ref?gt(i.ref,t,e):i&&i.refs&&i.refs.forEach(a=>gt(a,t,e))}},zr=(e,r)=>{r.shouldUseNativeValidation&&Ht(e,r);const t={};for(const i in e){const a=f(r.fields,i),o=Object.assign(e[i]||{},{ref:a&&a.ref});if(Kr(r.names||Object.keys(e),i)){const u=Object.assign({},f(t,i));k(u,"root",o),k(t,i,u)}else k(t,i,o)}return t},Kr=(e,r)=>{const t=bt(r);return e.some(i=>bt(i).match(`^${t}\\.\\d+`))};function bt(e){return e.replace(/\]|\[/g,"")}function Gr(e,r){for(var t={};e.length;){var i=e[0],a=i.code,o=i.message,u=i.path.join(".");if(!t[u])if("unionErrors"in i){var d=i.unionErrors[0].errors[0];t[u]={message:d.message,type:d.code}}else t[u]={message:o,type:a};if("unionErrors"in i&&i.unionErrors.forEach(function(x){return x.errors.forEach(function(b){return e.push(b)})}),r){var g=t[u].types,w=g&&g[i.code];t[u]=St(u,r,t,a,w?[].concat(w,i.message):i.message)}e.shift()}return t}function Xr(e,r,t){return t===void 0&&(t={}),function(i,a,o){try{return Promise.resolve(function(u,d){try{var g=Promise.resolve(e[t.mode==="sync"?"parse":"parseAsync"](i,r)).then(function(w){return o.shouldUseNativeValidation&&Ht({},o),{errors:{},values:t.raw?Object.assign({},i):w}})}catch(w){return d(w)}return g&&g.then?g.then(void 0,d):g}(0,function(u){if(function(d){return Array.isArray(d==null?void 0:d.errors)}(u))return{values:{},errors:zr(Gr(u.errors,!o.shouldUseNativeValidation&&o.criteriaMode==="all"),o)};throw u}))}catch(u){return Promise.reject(u)}}}const ss=({account:e,setAccount:r,isProfileDialogOpen:t,setIsProfileDialogOpen:i})=>{const{user:a}=R.use(ar),{toast:o}=nr(),{t:u}=or("edit-profile"),d=we.object({username:we.string().min(2,{message:"Username must be at least 2 characters."}),friend_id:we.string().regex(/^[0-9]{16}$/,{message:"Friend ID is not valid, it must be 16 digits without dashes."}),is_public:we.boolean().optional()}),g=Tr({resolver:Xr(d),values:{username:(e==null?void 0:e.username)||"",friend_id:(e==null?void 0:e.friend_id)||"",is_public:(e==null?void 0:e.is_public)||!1}}),w=async x=>{try{const b=await fr.from("accounts").upsert({email:a==null?void 0:a.user.email,username:x.username,friend_id:x.friend_id,is_public:x.is_public}).select().single();r(b.data),o({title:"Account saved.",variant:"default"})}catch(b){console.error("error saving account",b),o({title:"Error saving your account.",variant:"destructive"})}};return m.jsx(lr,{open:t,onOpenChange:i,children:m.jsxs(ur,{className:"border-2 border-slate-600 shadow-none",children:[m.jsx(cr,{children:m.jsx(dr,{children:u("editProfile")})}),m.jsxs(hr,{className:"mb-2 border-2 border-slate-600 shadow-none",children:[m.jsx(gr,{className:"h-4 w-4"}),m.jsx(yr,{children:u("updateProfile.title")}),m.jsx(mr,{children:u("updateProfile.description")})]}),m.jsx(Lr,{...g,children:m.jsxs("form",{onSubmit:g.handleSubmit(w),className:"space-y-8",children:[m.jsx(Ve,{name:"email",render:()=>m.jsxs(ye,{children:[m.jsx(me,{children:u("email")}),m.jsx(ge,{className:"mt-2",children:m.jsx(Oe,{placeholder:"Email",disabled:!0,value:a==null?void 0:a.user.email})}),m.jsx(be,{children:u("registeredEmail")})]})}),m.jsx(Ve,{control:g.control,name:"username",render:({field:x})=>m.jsxs(ye,{children:[m.jsx(me,{children:u("username")}),m.jsx(ge,{className:"mt-2",children:m.jsx(Oe,{placeholder:"Username",...x})}),m.jsx(be,{children:u("usernameDescription")}),m.jsx($e,{})]})}),m.jsx(Ve,{control:g.control,name:"friend_id",render:({field:x})=>m.jsxs(ye,{children:[m.jsx(me,{children:u("friendID")}),m.jsx(ge,{className:"mt-2",children:m.jsx(Oe,{placeholder:"Friend ID",...x})}),m.jsx(be,{children:u("friendIDDescription")}),m.jsx($e,{})]})}),m.jsx(Ve,{control:g.control,name:"is_public",render:({field:x})=>m.jsxs(ye,{className:"flex flex-col items-start",children:[m.jsx(ge,{className:"mt-2",children:m.jsxs("div",{className:"flex items-center gap-x-2 w-full",children:[m.jsx(me,{children:u("isPublic")}),m.jsx("div",{className:"grow-1",children:m.jsx(Wr,{checked:x.value,onCheckedChange:x.onChange})}),m.jsx(nt,{disabled:!(e!=null&&e.is_public),onClick:()=>window.open(`https://tcgpocketcollectiontracker.com/#/collection/${g.getValues().friend_id}`),children:u("isPublicButton")})]})}),m.jsx(be,{children:u("isPublicDescription")})]})}),m.jsx(nt,{type:"submit",children:u("save")})]})})]})})};export{ss as default};

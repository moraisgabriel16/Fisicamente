export type Row = {id:string; [key:string]:any};
export class ApiError extends Error { constructor(message:string, public status:number){super(message)} }
export async function api<T=any>(path:string, options:RequestInit={}):Promise<T>{
  const response=await fetch('/api/v1'+path,{credentials:'same-origin',...options,headers:{...(options.body && !(options.body instanceof FormData)?{'Content-Type':'application/json'}:{}),...options.headers}});
  if(!response.ok){const e=await response.json().catch(()=>({detail:'Não foi possível concluir a solicitação.'}));throw new ApiError(e.detail||'Erro inesperado.',response.status)}
  return response.json();
}
export const send=(path:string,data:unknown,method='POST')=>api(path,{method,body:JSON.stringify(data)});
export const today=()=>new Date().toLocaleDateString('en-CA',{timeZone:'America/Sao_Paulo'});
export const fmt=(n:number|null|undefined)=>n==null?'—':n.toLocaleString('pt-BR',{maximumFractionDigits:1,minimumFractionDigits:1});
export const dateLabel=(s:string)=>s?new Date(s.length===10?s+'T12:00:00':s).toLocaleDateString('pt-BR'):'—';
export async function download(path:string,name:string){
  const r=await fetch('/api/v1'+path,{credentials:'same-origin'});
  if(!r.ok){const error=await r.json();throw new Error(error.detail||'Falha no download.')}
  const url=URL.createObjectURL(await r.blob()),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

// A separate IndexedDB store per authenticated user avoids mixing offline queues.
function database(){return new Promise<IDBDatabase>((resolve,reject)=>{const req=indexedDB.open('fisicamente-offline',1);req.onupgradeneeded=()=>req.result.createObjectStore('data');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
export async function readLocal(key:string){const db=await database();return new Promise<any>((resolve,reject)=>{const tx=db.transaction('data');const req=tx.objectStore('data').get(key);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);tx.oncomplete=()=>db.close()})}
export async function writeLocal(key:string,value:any){const db=await database();return new Promise<void>((resolve,reject)=>{const tx=db.transaction('data','readwrite');if(value===undefined)tx.objectStore('data').delete(key);else tx.objectStore('data').put(value,key);tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>reject(tx.error)})}
export async function clearLocal(){const db=await database();return new Promise<void>((resolve,reject)=>{const tx=db.transaction('data','readwrite');tx.objectStore('data').clear();tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>reject(tx.error)})}

let loading:Promise<any>|undefined;
export function loadGeo():Promise<any>{
 if((window as any).d3)return Promise.resolve((window as any).d3);
 if(!loading)loading=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='/vendor/d3.min.js';script.onload=()=>resolve((window as any).d3);script.onerror=()=>{loading=undefined;script.remove();reject(new Error('Map could not load'));};document.head.appendChild(script);});
 return loading;
}

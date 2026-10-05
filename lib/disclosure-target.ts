// Keep hash-linked evidence reachable even when its details element is closed.
export function hashTargetId(hash:string){try{return hash.startsWith('#')?decodeURIComponent(hash.slice(1)):'';}catch{return '';}}
export function revealDisclosure(target:HTMLElement,focus=true){
 const child=target.matches('details')?target:target.querySelector<HTMLDetailsElement>('details[data-anchor-disclosure]');
 if(child)child.setAttribute('open','');
 let parent:HTMLElement|null=target;
 while(parent){if(parent.matches('details'))parent.setAttribute('open','');parent=parent.parentElement;}
 const heading=(child||target).querySelector<HTMLElement>('summary,h1,h2,h3')||target;
 if(focus){if(!heading.matches('summary,a,button,input,select,textarea,[tabindex]'))heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});}
 target.scrollIntoView({block:'start',behavior:'auto'});
}

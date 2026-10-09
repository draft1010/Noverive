export const EXPEDITIONS=[
 {id:'city-lake',name:'Des avenues aux rives',text:'Découvrez le centre des Horizons et le lac des Reflets.',places:['downtown','lake'],coins:75},
 {id:'recycling',name:'Seconde vie',text:'Rapportez 8 composants récupérés dans les quartiers urbains.',cost:{scrap:8},coins:80},
 {id:'forest-supplies',name:'Les chemins vivants',text:'Découvrez la forêt et rapportez 6 bois et 6 fibres.',places:['forest'],cost:{wood:6,fiber:6},coins:90},
 {id:'geology',name:'Sous la surface',text:'Explorez la carrière et la grotte. Rapportez 4 minerais et 2 cristaux.',places:['quarry','cave'],cost:{ore:4,crystal:2},coins:140},
 {id:'horizons',name:'Jusqu’aux lointains',text:'Découvrez les crêtes et la réserve sauvage.',places:['mountain','wild'],coins:160},
];
export function expeditionReady(state,e){return !state.flags[`expedition:${e.id}`]&&(e.places||[]).every(id=>state.discovered.includes(id))&&Object.entries(e.cost||{}).every(([id,n])=>(state.inventory[id]||0)>=n);}
export function completeExpedition(state,id){const e=EXPEDITIONS.find(e=>e.id===id);if(!e||!expeditionReady(state,e))return false;for(const [id,n] of Object.entries(e.cost||{}))state.inventory[id]-=n;state.coins+=e.coins;state.flags[`expedition:${id}`]=true;return true;}

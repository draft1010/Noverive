import {PLAN} from '../world/plan.js';
const ORDERS=[
 {name:'Le panier de Maëlle',item:'crop',count:3,coins:65},
 {name:'Le chantier de Tess',item:'wood',count:8,coins:55},
 {name:'Les tissus de Soline',item:'flax',count:3,coins:80},
 {name:'Le dîner du quartier',item:'fish',count:2,coins:65},
 {name:'La réserve du moulin',item:'wheat',count:4,coins:85},
 {name:'La soupe des voisins',item:'carrot',count:4,coins:75},
 {name:'Les lanternes du parc',item:'crystal',count:2,coins:100},
 {name:'Le sentier des promeneurs',item:'stone',count:8,coins:55},
 {name:'Les cordages du jardin',item:'fiber',count:6,coins:50},
];
export const DELIVERY_STOPS=[
 {id:'market',name:'Les halles',x:-72,z:24},
 {id:'quarry',name:'La carrière',x:260,z:-200},
 {id:'cave',name:'La grotte',x:465,z:-374},
 {id:'forest',name:'La clairière',x:180,z:80},
];
export function orders(s){return [0,1,2].map(i=>({...ORDERS[((s.day-1)*3+i)%ORDERS.length],id:`${s.day}:${i}`}));}
export function orderReady(s,o){return !s.flags[`order:${o.id}`]&&(s.inventory[o.item]||0)>=o.count;}
export function reputation(s){return s.flags.communityReputation||0;}
export function shopPrice(s,price){return Math.max(1,Math.floor(price*(1-Math.min(.10,Math.floor(reputation(s)/60)*.025))));}
export function rank(s){return ['Nouveau voisin','Voisin apprécié','Artisan des Horizons','Pilier de Noverive','Légende des jardins'][Math.min(4,Math.floor(reputation(s)/60))];}
export function deliverOrder(s,id){const o=orders(s).find(o=>o.id===id);if(!o||!orderReady(s,o))return false;s.inventory[o.item]-=o.count;s.coins+=o.coins;s.flags[`order:${id}`]=true;s.flags.ordersDone=(s.flags.ordersDone||0)+1;s.flags.communityReputation=reputation(s)+10;return true;}
export const MILESTONES=[
 {id:'gardener',name:'Les mains dans la terre',goal:20,value:s=>s.stats.harvested,reward:150,text:'Récolter 20 cultures.'},
 {id:'friends',name:'Une famille extraordinaire',goal:6,value:s=>new Set(s.team.map(c=>c.id)).size,reward:180,text:'Lier six espèces différentes.'},
 {id:'explorer',name:'Les horizons vous appartiennent',goal:10,value:s=>new Set(s.discovered).size,reward:200,text:'Découvrir dix lieux.'},
 {id:'decorator',name:'Un lieu à soi',goal:12,value:s=>s.buildings.filter(b=>b.type!=='car').length,reward:120,text:'Installer douze meubles et aménagements.'},
 {id:'driver',name:'La route des rencontres',goal:3000,value:s=>Math.floor(s.flags.drivenMeters||0),reward:200,text:'Parcourir trois kilomètres au volant.'},
 {id:'neighbor',name:'On peut compter sur vous',goal:12,value:s=>s.flags.ordersDone||0,reward:250,text:'Honorer douze commandes de voisins.'},
];
export function claimMilestone(s,id){const m=MILESTONES.find(m=>m.id===id);if(!m||s.flags[`milestone:${id}`]||m.value(s)<m.goal)return false;s.flags[`milestone:${id}`]=true;s.coins+=m.reward;s.flags.communityReputation=reputation(s)+20;return true;}
export function startDelivery(s){if(s.flags.delivery||s.flags.deliveryDay===s.day||!s.buildings.some(b=>b.type==='car'))return false;s.flags.delivery={stop:(s.day-1)%DELIVERY_STOPS.length,stage:'pickup'};return true;}
export function deliveryTarget(s){const d=s.flags.delivery;return !d?null:d.stage==='pickup'?{...PLAN.workshop,name:'Atelier · charger le colis',id:'home'}:DELIVERY_STOPS[d.stop];}
export function updateDelivery(s,driving){const d=s.flags.delivery;if(!d||s.location!=='world')return null;const p=deliveryTarget(s);if(Math.hypot(s.player.x-p.x,s.player.z-p.z)>12||!driving)return null;if(d.stage==='pickup'){d.stage='deliver';s.flags.marker=DELIVERY_STOPS[d.stop].id;return 'Colis chargé ! Livraison : '+DELIVERY_STOPS[d.stop].name;}s.coins+=160;s.flags.communityReputation=reputation(s)+15;s.flags.deliveryDay=s.day;s.flags.deliveriesDone=(s.flags.deliveriesDone||0)+1;delete s.flags.delivery;return 'Livraison terminée · +160 ambres · +15 réputation';}

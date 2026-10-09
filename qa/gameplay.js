import * as game from '../src/main.js';
import {newState,normalizeSave,craft,save,load,farmAction,tickFarm,canPlace} from '../src/systems/state.js';
import {RECIPES,MOVES} from '../src/systems/data.js';
import {BUILDABLES,transfer,recover} from '../src/systems/homestead.js';
const panel=document.createElement('section');panel.id='qa';panel.style='position:fixed;z-index:999;right:8px;top:8px;background:#fff7dc;padding:8px;max-width:440px;max-height:75vh;overflow:auto;color:#243e34;font:13px monospace';panel.innerHTML='<button id="qa-run">Exécuter les scénarios QA</button><button id="qa-home">Voir la maison QA</button><button id="qa-battle">Voir le combat QA</button><button id="qa-fish">Voir la pêche QA</button><button id="qa-world">Voir la ville QA</button><button id="qa-touch">Interface tactile QA</button><button id="qa-more">Pêche et reprise QA</button><pre id="qa-results"></pre>';document.body.append(panel);
const out=panel.querySelector('pre');let report=[];
const check=(name,pass)=>{report.push({name,pass:!!pass});out.textContent=report.map(r=>(r.pass?'✓ ':'✗ ')+r.name).join('\n');if(!pass)throw Error(name);};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function fixture(){const s=newState();s.name='QA';s.settings.quality='medium';s.settings.sound=false;document.querySelector('#debug').hidden=false;s.inventory={wood:20,stone:20,fiber:20,seed:30,plank:12,iron:4,cloth:6,chair:3,chest:1,seal:8,potion:3};s.player={x:-36,z:29};s.discovered=['city','home','forest','ruins'];s.buildings=[{type:'sleepingBed',x:-5,z:3,y:0,location:'home',r:0},{type:'chest',x:-6,z:-4,y:0,location:'home',r:0,storage:{}},{type:'workbench',x:2,z:-5,y:0,location:'home',r:0},{type:'furnace',x:4,z:4,y:0,location:'home',r:0},{type:'stove',x:-5,z:4,y:3.6,location:'home',r:0}];return s;}
import {ITEMS as awaitLabels} from '../src/systems/data.js';
async function run(){try{report=[];game.begin(fixture());await wait(1200);check('Nouvelle partie et personnage chargé',game.player.userData.ready);const memory=[];
for(let i=0;i<8;i++){game.openMenu(i%2?'bestiary':'team');await wait(180);game.closeModal();}await wait(400);check('16 transitions menu/jeu, contexte WebGL actif',!game.renderer.getContext().isContextLost());
const before=game.state.buildings.length;game.enterHome();await wait(400);check('Intérieur chargé, rendu isolé',!!game.interior&&game.player.parent===game.interior.scene);
game.state.player={x:-3,z:1,y:0};game.movePlayer(0);game.startBuild('chair');game.input.onGround(1,1); // then cancel: inventory must remain unchanged.
const stock=game.state.inventory.chair;game.cancelBuild();check('Annuler placement conserve le mobilier',game.state.inventory.chair===stock&&game.state.buildings.length===before);
game.startBuild('chair');game.placeBuilding();check('Placement intérieur confirmé',game.state.buildings.length===before+1);game.furnishingMenu(before);game.closeModal();game.startBuild('chair',before);game.placeBuilding();check('Déplacement sans duplication',game.state.buildings.length===before+1&&game.state.inventory.chair===stock-1);
const chest=game.state.buildings.find(b=>b.type==='chest');transfer(game.state,chest,'wood',2,true);save(game.state);const restored=load();check('Sauvegarde conserve intérieur et coffre',restored.location==='home'&&restored.buildings.find(b=>b.type==='chest').storage.wood===2);transfer(game.state,chest,'wood',2,false);
game.state.player={x:7,z:3,y:0};game.input.angle=-.65;game.input.keys.add('w');for(let i=0;i<120;i++)game.movePlayer(1/60);game.input.keys.clear();check('Escalier monté par le contrôleur de déplacement',game.state.player.y>3.5);game.input.keys.add('s');for(let i=0;i<120;i++)game.movePlayer(1/60);game.input.keys.clear();check('Escalier descendu par le contrôleur',game.state.player.y<.2);
game.leaveHome();check('Sortie rétablit le monde et libère la maison',game.interior===null&&game.state.location==='world');
check('Axe nord dégagé devant la mairie',!game.world.collides(-9,-27,.4));check('Entrée de ferme dégagée',!game.world.collides(-19,19,.4));check('Bordures infranchissables',game.world.collides(319,0)&&game.world.collides(0,319));
const w=game.world.wild.find(w=>w.id!=='gardien');game.startBattle(w);await wait(300);check('Combat démarré',!document.querySelector('#battle').hidden);
for(const id of Object.keys(MOVES)){game.battle.enemy.hp=game.battle.enemy.maxHp;game.battle.ally.energy=30;await game.applyMove(game.battle.ally,game.battle.enemy,id,true);await wait(300);check('Effet attaque '+id,!game.renderer.getContext().isContextLost());}
game.endBattle('QA');await wait(400);check('Retour combat conserve le contexte',!game.renderer.getContext().isContextLost());
check('Aucune erreur JS',window.ambreluneDiagnostics().errors.length===0);report.push({name:'Scénarios terminés',pass:true});out.textContent=report.map(r=>(r.pass?'✓ ':'✗ ')+r.name).join('\n');}catch(e){out.textContent+='\nERREUR: '+e.stack;}}
panel.querySelector('#qa-run').onclick=run;
panel.querySelector('#qa-home').onclick=()=>{game.begin(fixture());game.enterHome();};
panel.querySelector('#qa-world').onclick=()=>{game.begin(fixture());game.state.player={x:-9,z:8};game.movePlayer(0);};
panel.querySelector('#qa-fish').onclick=()=>{game.begin(fixture());game.state.player={x:13,z:18};game.movePlayer(0);game.fishing();};
panel.querySelector('#qa-battle').onclick=()=>{game.begin(fixture());game.startBattle(game.world.wild.find(w=>w.id!=='gardien'));};

panel.querySelector('#qa-touch').onclick=()=>{game.begin(fixture());game.state.settings.touch=true;document.body.classList.add('touch');game.openMenu('bag');};
panel.querySelector('#qa-more').onclick=async()=>{
 try {
  report=[];game.begin(fixture());game.enterHome();game.state.player={x:-4,z:-4,y:3.6};game.movePlayer(0);save(game.state);game.begin(load());check('Reprise de sauvegarde à l’étage',game.state.location==='home'&&game.state.player.y===3.6&&!!game.interior);
  game.leaveHome();game.state.player={x:13,z:18};game.movePlayer(0);
  const {FishingSession}=await import('../src/rendering/fishing.js');
  let wins=0,failures=0;const session=new FishingSession(game.world.scene,game.player,18,18,(won)=>won?wins++:failures++);
  let elapsed=0;
  while(!session.finished && elapsed<45){if(session.phase==='bite')session.press();if(session.phase==='reel')session.holding=session.tension<.54;session.update(1/30,elapsed);elapsed+=1/30;await wait(1);}
  check('Pêche complète : lancer, touche, tension et récupération',wins===1&&failures===0);
  session.finish(true,'');check('Récompense de pêche attribuée une seule fois',wins===1);
  const early=new FishingSession(game.world.scene,game.player,18,18,won=>won?wins++:failures++);early.update(1,0);early.press();check('Ferrer trop tôt échoue sans récompense',failures===1&&wins===1);
  const cancel=new FishingSession(game.world.scene,game.player,18,18,won=>won?wins++:failures++);cancel.finish(false,'');check('Annulation de pêche retire l’interface',!document.querySelector('.fishing-panel'));
  for(const id of ['axe','pick','water','hoe']){game.selectTool(id);game.player.userData.playAction(id==='water'?'Farm_Watering':'Farm_Harvest');await wait(400);check('Outil équipé et animé : '+id,game.player.getObjectByName('HeldTool')!==undefined);}
  check('Aucune erreur dans les essais complémentaires',window.ambreluneDiagnostics().errors.length===0);
 }catch(e){out.textContent+='\nERREUR '+e.stack;}
};
const qaStyles=document.createElement('style');qaStyles.textContent='body.modal-open #qa{display:none}#qa{max-width:calc(100vw - 24px)!important;box-sizing:border-box}';document.head.append(qaStyles);
const audit=document.createElement('button');audit.textContent='Auditer les chemins QA';panel.append(audit);
audit.onclick=async()=>{game.begin(fixture());const {isRoad}=await import('../src/world/world.js');const {findPath}=await import('../src/systems/navigation.js');const conflicts=game.world.colliders.filter(c=>c.x<10&&c.x>-50&&c.z<25&&c.z>-54&&isRoad(c.x,c.z));out.textContent=JSON.stringify({roadCenters:conflicts,paths:[[-36,29,-9,8],[-9,8,-9,-50]].map(([x,z,tx,tz])=>findPath({x,z},{x:tx,z:tz},(a,b)=>game.world.collides(a,b,.4)).length)},null,2);};
const contextTest=document.createElement('button');contextTest.textContent='Restauration WebGL QA';panel.append(contextTest);
contextTest.onclick=async()=>{report=[];try{game.begin(fixture());await wait(800);const gl=game.renderer.getContext(),ext=gl.getExtension('WEBGL_lose_context');if(!ext)throw Error('Extension de test indisponible');const name=game.state.name;ext.loseContext();await wait(300);ext.restoreContext();await wait(1800);check('WebGL restauré après une perte simulée',!gl.isContextLost());check('Partie préservée après restauration',game.state.name===name);check('Aucune erreur JS de restauration',window.ambreluneDiagnostics().errors.length===0);}catch(e){out.textContent+='\n'+e.stack;}};
const furnitureTest=document.createElement('button');furnitureTest.textContent='Coffre et repos QA';panel.append(furnitureTest);
furnitureTest.onclick=async()=>{report=[];try{game.begin(fixture());game.enterHome();const b=game.state.buildings.find(b=>b.type==='chest'),i=game.state.buildings.indexOf(b),stock=game.state.inventory.wood;game.furnishingMenu(i);document.querySelector('[data-store="wood"]').click();check('Bouton déposer : sac et coffre mis à jour',b.storage.wood===1&&game.state.inventory.wood===stock-1);document.querySelector('#recoverObject').click();check('Récupération refusée si coffre rempli',game.state.buildings.includes(b));document.querySelector('[data-take="wood"]').click();check('Bouton retirer : quantité conservée',(b.storage.wood||0)===0&&game.state.inventory.wood===stock);document.querySelector('#recoverObject').click();check('Coffre vide récupéré',!game.state.buildings.includes(b));const bed=game.state.buildings.findIndex(b=>b.type==='sleepingBed');game.state.time=12;game.state.team[0].hp=1;game.furnishingMenu(bed);document.querySelector('#restEvening').click();check('Lit : repos jusqu’au soir et soin',game.state.time===19&&game.state.team[0].hp===game.state.team[0].maxHp);const day=game.state.day;game.furnishingMenu(bed);document.querySelector('#restMorning').click();check('Lit : lendemain matin',game.state.day===day+1&&game.state.time===7);check('Aucune erreur mobilier',window.ambreluneDiagnostics().errors.length===0);}catch(e){game.closeModal();out.textContent+='\n'+e.stack;}};
const hideQA=document.createElement('button');hideQA.textContent='Masquer les outils QA';panel.append(hideQA);hideQA.onclick=()=>{panel.hidden=true;document.querySelector('#debug').hidden=true;};


# Refonte Noverive — 9 octobre 2026

Voir REFONTE-NOVERIVE.md pour le périmètre livré, les assets, les tests et les limites de validation mobile. Cache v41. 33 tests automatisés réussis, scénarios navigateur et parcours de régions sans erreur signalée. Les entrées ci-dessous décrivent les révisions historiques antérieures.

# Révision outils, fontaine et faune — 4 octobre 2026

Modifications dans le dossier du Bureau. Cache v11.

- Intérieur : fin du chevauchement vertical des murs ; planchers et boiseries exclus de la découpe de visibilité.
- Prise des outils déplacée du poignet vers la paume, orientation stabilisée indépendamment de la torsion du poignet ; arrosoir droit et canne inclinée vers l’eau.
- Fontaine : écoulement animé, gouttes et rides concentriques.
- Suppression des panneaux de serre traversant le toit du conservatoire. Mairie déplacée en (-9, -55), au bout de l’allée nord ; exclusion des arbres autour du nouvel emplacement.
- Apparitions aléatoires (espèces pondérées par rareté et positions), uniquement au nord et à l’est, avec contrôle des collisions après création des ressources et espacement entre apparitions. Renouvellement après rencontre et changement de jour à distance du joueur. Veilleur fixe ; conditions de Lumignon et Coralys conservées.
- Huit modèles supplémentaires issus du pack local Downloads/pack monster, copiés dans assets/monsters ; licence CC0 conservée. Huit attaques supplémentaires avec dégâts, énergie, affinités et effets visuels.

| Espèce | Élément | Nouvelle attaque | Habitat |
|---|---|---|---|
| Mélipom | nature | Dard floral | Clairières de l’est |
| Dracendre | feu | Souffle de braise | Rochers de l’est |
| Rainélie | eau | Bulles rebondissantes | Rives orientales |
| Nivours | eau | Grésil de rosée | Hauteurs du nord |
| Galétis | terre | Éboulis | Rochers de l’est |
| Alizelle | air | Rafale des crêtes | Hauteurs du nord |
| Germousse | nature | Graines bondissantes | Bois de l’est |
| Aurélièvre | lumiere | Rayon du matin | Clairières du nord |

Validation : 26 tests automatisés réussis (dont distribution de 1 000 apparitions, obstacles/espacement, données des huit modèles, combat et sauvegarde des nouvelles espèces). Dans le navigateur : huit modèles chargés, population et zones vérifiées, renouvellement quotidien, huit nouvelles attaques exécutées ; parcours complet avec 16 transitions menu/jeu, escalier monté/descendu, sauvegarde et 18 effets de combat. Aucune erreur JavaScript ni avertissement dans les diagnostics finaux. Vérification visuelle de l’arrosoir, de la hache, de la canne, de l’escalier, de la mairie et de la fontaine. 24 modules valides ; 40 entrées de cache accessibles.

Les essais utilisent toujours le port 4186 distinct du jeu habituel sur 4173. Les mesures de performances ci-dessous appartiennent à la révision initiale ; ce ne sont pas un nouveau comparatif de cette révision.

---

# Corrections des captures — 4 octobre 2026

- Boutique déplacée de l’autre côté de la rue, façade vers le chemin ; haie et arbre déplacés pour dégager son accès et son toit.
- Porte intérieure à panneaux, murs et main courante de l’escalier, garde-corps du palier ; suppression de la fausse ouverture blanche à l’étage.
- Fil attaché à la pointe réelle de la canne et au flotteur après chaque déplacement, y compris récupération ; retour du flotteur continu.
- Gravier dans les cours et accès de maisons, chemins pavés conservés.
- Sanctuaire réservé sans arbres procéduraux, terrain aplani sous la plateforme.
- Deux ponts raccordés aux berges ; surface de clic déformée avec le tablier ; terrain exclu de la découpe caméra qui révélait le fond blanc.
- Grosses montagnes périphériques supprimées, terrain et eau prolongés ; limite invisible conservée, petites bordures végétalisées à l’extérieur.

Validation : 22 tests automatisés réussis ; parcours complet dans le navigateur, dont montée et descente réelles ; 13 contrôles ciblés réussis (ponts, collisions, sanctuaire, fil durant chaque phase), aucune erreur JavaScript. Inspection visuelle du quartier, de la maison, de la pêche, du sanctuaire, du pont et de la limite est. 22 modules valides et 38 entrées de cache accessibles. Cache actualisé en v10. Les essais utilisent le port 4186, distinct des sauvegardes habituelles sur 4173.

---

# Vérifications — révision du 4 octobre 2026

Modifications effectuées directement dans le dossier ambrelune du Bureau. Les essais ont utilisé une origine locale distincte (port 4186) pour ne pas écraser les sauvegardes du jeu habituel sur 4173.

## Résultats

- 21 modules JavaScript valides et 37 entrées du cache accessibles (HTTP 200).
- 19 tests automatisés réussis : ancienne sauvegarde, recettes, semences, croissance, récolte, stockage, récupération, placement, étages, collisions, navigation, combat et missions.
- Parcours réel dans le navigateur : nouvelle partie, 16 transitions carnet/jeu, entrée/sortie de maison, montée et descente par le contrôleur, pose/annulation/déplacement, coffre sauvegardé, reprise à l’étage, dix effets d’attaque, retour au monde.
- Boutons du coffre : dépôt, retrait, refus de récupérer un coffre rempli, récupération une fois vide. Lit : soir, soin, lendemain matin.
- Pêche : lancer, attente, touche, tension, récupération, récompense unique, échec prématuré et annulation. Quatre outils équipés et animations déclenchées.
- Perte WebGL simulée puis restauration : rendu rétabli, partie conservée, aucune erreur JavaScript dans les diagnostics.
- Interface à 390 × 844 et 844 × 390 : huit destinations du carnet visibles, recherche du sac, fabrication, retour au monde ; boutons de placement de 44 pixels minimum dans l’écran.
- Trajets calculés jardin → place et place → sortie nord disponibles. Collision aux limites et dégagement devant la mairie et l’entrée du jardin contrôlés.

## Corrections de stabilité

Les portraits de créatures créaient des contextes WebGL distincts et leurs nettoyages pouvaient libérer des ressources procédurales partagées avec le monde. Ils utilisent maintenant un seul moteur partagé et des aperçus 2D ; seules les ressources possédées par chaque scène sont libérées. La destruction des modèles chargés tardivement est également prise en compte. Un import de portrait manquant au démarrage a été corrigé.

Les changements de taille ignorent les dimensions nulles ; le rendu suspendu reprend après restauration WebGL. Les scènes de maison sont libérées à la sortie ; le monde extérieur n’est pas animé pendant les intérieurs ou les combats. Ces corrections traitent des causes identifiées dans le code ; le bug intermittent exact sur le téléphone du propriétaire n’a pas été reproduit sur cet appareil.

## Mesure Medium sur cet ordinateur

Comparaison ponctuelle au même endroit (-9, 8), fenêtre 1280 × 720, DPR 1. La version de référence a reçu uniquement l’import manquant nécessaire à son lancement et un démarrage de mesure.

| | Avant | Après |
| --- | ---: | ---: |
| Temps d’image observé | 6,1 ms | 6,1 ms |
| FPS observés | 165 | 163,1 |
| Appels de rendu | 266 | 280 |
| Triangles | 3 039 139 | 2 837 471 |

Cette mesure ne garantit pas l’absence de régression sur un GPU mobile. Gestes, chauffe, endurance, installation HTTPS/PWA et performances sur smartphone physique restent à valider. Les dix effets ont été exécutés, mais l’équilibrage d’une partie entière jusqu’au Veilleur n’a pas été rejoué. Les maisons partagent un intérieur commun ; il ne s’agit pas d’intérieurs uniques pour chaque habitant.

## Rejouer les essais

Règles : node --test tests/*.test.mjs. Parcours navigateur : work/qa.html avec un serveur local et une origine dédiée aux tests. Les boutons QA créent des parties artificielles et écrivent dans la sauvegarde de cette origine : ne pas les ouvrir sur l’origine de votre partie personnelle.

---

# Historique antérieur

# Vérifications — Ambrelune 0.3

## Révision du carnet et du combat

- Jauges PV/XP visibles dans Compagnons ; PV adverses, PV/XP/énergie du compagnon en combat.
- Illustrations pour les 17 objets, utilisées dans Sac, Fabriquer, les ingrédients, Jardin et les aménagements récupérables.
- Parcours des quatre pages dans le navigateur, reprise de sauvegarde puis rencontre de Vélune. Une attaque a fait passer les PV adverses de 56 à 47 et l’énergie de 30 à 25 ; la riposte a fait passer les PV du compagnon de 64 à 45. Les jauges et les valeurs accessibles ont suivi ces changements.
- Combat contrôlé en 844 × 390 : jauges et actions restent visibles sans couvrir les créatures.
- Les 11 tests des règles du jeu passent après modification. Le dossier de cette version a été restauré depuis l’archive 0.2, le précédent dossier ayant disparu pendant le travail.

## Révision du 2 octobre — habitants et direction artistique

- Référence Willowmere ouverte et observée dans le navigateur : matières, densité, contrastes et échelle des détails ont guidé cette révision. Aucun asset du site n’a été récupéré.
- Marche des habitants remplacée par une navigation entre points de passage à 1,35 m/s, avec pauses. L’animation dépend désormais du déplacement effectivement réalisé. Un test vérifie le trajet, le contournement d’un obstacle et l’arrêt près du joueur.
- **11 tests réussis** après révision ; **21 fichiers de cache accessibles**. Les résultats chiffrés plus bas correspondent à la version précédente.
- Trois nouvelles boutiques près de la place, auvents, terrasses, enseignes, guirlandes, poteries, caisses, massifs irréguliers, arbres fleuris, matières des sols/feuillages/bois/toitures, couleurs et éclairage retravaillés.
- Rendu pixel désactivable, interface conservée en pleine résolution. La résolution du monde est plafonnée à 960 pixels de large dans ce mode : les FPS ne sont donc pas directement comparables aux anciens relevés en pleine résolution.
- Contrôle visuel après correction d’une erreur de compilation du matériau du sol pendant le développement. Aucun nouveau message d’erreur du shader après correction.
- Reprise de sauvegarde, déplacement au clic, voyage rapide et repos vérifiés après la révision. La nouvelle scène a été observée à environ 137–165 FPS en fenêtre 1744 × 1244, mode pixel, sur cet ordinateur ; ce sont des relevés ponctuels et non une garantie.

## Historique — vérifications de la version 0.1

Livraison du 2 octobre 2026. Première région jouable ; les limites de contenu sont détaillées dans LISEZ-MOI.md.

## Tests automatisés

Commande : `node --test tests/systems.test.mjs`.

Résultat final : **10 tests réussis, aucun échec**. Ils couvrent la recherche de chemin autour des obstacles, la conservation des constructions/cultures/compagnons dans les sauvegardes, le rejet des sauvegardes invalides, les coûts de fabrication, la croissance et la récolte, la pluie, les dégâts élémentaires et la protection, les chances de capture, les contraintes de placement et les prérequis des missions.

Les 19 entrées du cache de l’application ont toutes répondu HTTP 200. La syntaxe des modules JavaScript a été vérifiée séparément.

## Parcours effectués dans le navigateur

- Création de partie avec Ondril, dialogue avec Maëlle et première récompense.
- Déplacement au clic, contournement d’obstacles, passage du pont et voyage vers les lieux découverts.
- Plantation et arrosage de trois parcelles, croissance, récolte et fabrication de tisanes avec consommation des ingrédients.
- Rencontre de Vélune : attaques, dégâts, soin, captures échouées consommant des liens, puis capture réussie et ajout à l’équipe.
- Repos à la maison, changement de jour et pluie.
- Récolte de bois à la hache et de cristal à la pioche ; fabrication d’une lanterne.
- Construction : rejet d’un placement sur une culture, aperçu valide sur terrain libre, rotation et pose persistante.
- Combat dans la scène dédiée, attaque critique, riposte et fuite ; lisibilité contrôlée en format mobile paysage.
- Commandes tactiles : joystick, caméra et interaction utilisés dans une fenêtre de 844 × 390 pixels.
- Rechargement avec conservation de la progression. Puis arrêt réel du serveur, rechargement depuis le cache et reprise de la partie : équipe et progression retrouvées. Le serveur a ensuite été redémarré.
- Contrôle du rendu des feuillages qui s’effacent localement devant le personnage. Aucun avertissement de compilation des shaders observé.

## Mesures de rendu

Relevés ponctuels du panneau de diagnostic, dans le navigateur intégré, sur cet ordinateur. Le DPR était de 1. Ces valeurs ne constituent ni un minimum garanti ni une mesure sur téléphone. La fréquence observée autour de 165 FPS semble plafonnée par la cadence d’affichage.

| Fenêtre | Profil | FPS observés | Temps d’image | Appels de rendu | Triangles |
| --- | --- | ---: | ---: | ---: | ---: |
| 1920 × 1080 | Haute | 165 | 6,1 ms | 369 | 564 404 |
| 2560 × 1440 | Haute | 165 | 6,1 ms | 369 | 564 404 |
| 3840 × 2160 | Ultra | 165 | 6,1 ms | 372 | 564 468 |
| 844 × 390, simulation sur PC | Moyenne | 165 | 6,1 ms | 332–346 | 521 000–547 000 |

Les trois grands formats affichaient 20 secteurs de végétation sur 25. Le masquage à distance ne décharge pas encore la géométrie de la mémoire. Les captures de mesure se trouvent dans `captures/`.

## Vérifications restantes

- Performances, chauffe, autonomie et gestes sur un véritable appareil Android.
- Installation PWA depuis une adresse HTTPS et essais dans plusieurs navigateurs.
- Équilibrage d’une partie complète jusqu’au Veilleur ; victoire finale non validée manuellement.
- Parcours manuel exhaustif de la pêche et de chaque capacité d’aide au jardin.
- Endurance sur plusieurs heures et mesure des pires temps d’image dans toutes les zones.

Le fonctionnement hors ligne a été testé après une première visite en ligne. L’installation mobile et un premier démarrage sans réseau ne sont pas couverts par ce test.



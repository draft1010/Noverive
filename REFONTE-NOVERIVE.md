# Noverive — refonte d’Ambrelune

Version locale du 9 octobre 2026. Le projet modifié se trouve dans `C:\Users\cramo\Desktop\ambrelune`.

## Jouer

Lancer `Lancer-Noverive.cmd`, puis utiliser le navigateur ouvert sur `http://localhost:4173`. Le lanceur utilise Node installé sur cet ordinateur. Conserver sa fenêtre ouverte pendant la partie. Le jeu fonctionne aussi avec un serveur HTTP statique ; ouvrir directement index.html en fichier local ne suffit pas.

Les sauvegardes restent dans le navigateur et sur l’adresse habituelle. La clé historique `ambrelune.save.v1` est volontairement conservée. Ne pas changer de navigateur ou de port pour retrouver automatiquement une ancienne partie. Le carnet, rubrique Réglages, permet d’exporter et d’importer une sauvegarde.

PC : ZQSD/WASD/flèches pour marcher, Maj pour courir, E pour interagir, molette pour le zoom, clic droit pour orienter la caméra, Tab pour le carnet, M pour la carte. Sur mobile, jouer en paysage avec le joystick et les boutons tactiles. Commencer avec la qualité Basse.

## Monde livré

Le terrain mesure 640 × 640 mètres, contre environ 132 × 125 auparavant. Il comporte neuf régions : centre des Horizons, quartier des Jardins, plaine des Vergers, forêt des Murmures, lac des Reflets, carrière des Roches Claires, crêtes du Levant, grotte de Résonance et réserve des Lointains.

Le plan contient 98 bâtiments et 2 797 placements de modèles. Les rues utilisent les modèles de chaussées, intersections, véhicules et mobilier du pack City. Les quartiers comprennent des habitants animés, commerçants, parc, marché, ressources de récupération et créatures urbaines. Les véhicules sont stationnés. Les bâtiments visitables sont la maison du joueur, le Café des Sources, la Maison des Jardins et la Maison des Explorateurs.

La ferme conserve ses parcelles jouables et reçoit maison, grange, silo, serre, tracteur et cultures environnantes. La maison conserve ses deux niveaux, son escalier et le placement du mobilier. Lits, tables, chaises, armoires, étagères, fours et canapé utilisent les modèles sélectionnés. Le canapé se fabrique ou s’achète.

Les 16 espèces existantes, combats, captures, inventaire, coffres, cultures, fabrication et progression principale sont conservés. Les rencontres sont distribuées par habitat et niveau régional. 767 emplacements de ressources accessibles sont répartis selon leur environnement. Le lac propose la pêche. Cinq expéditions ajoutent découverte, collecte et récompenses uniques ; les débris urbains se recyclent en métal. Les futurs usages élémentaires des compagnons disposent d’une table de correspondance ; les nouvelles capacités de terrain ne sont pas encore un système jouable.

Le joueur et les PNJ portent désormais des tenues contemporaines. Le joueur conserve les outils attachés à sa main, les déplacements animés et les gestes de travail. Le nom Noverive, le logo, les icônes et l’écran d’accueil remplacent l’identité précédente.

## Assets

Les neuf familles demandées ont été exploitées à partir des archives locales. Aucun téléchargement depuis le lien privé itch.io n’a été nécessaire.

| Pack | Utilisation |
|---|---|
| Cartoon City Massive Pack | Bâtiments, routes, mobilier urbain, voitures, kiosques |
| Analog Memory 80/90 | Lit, armoire et décoration intérieure |
| Kitchen / Restaurant | Tables, chaises, canapé, cuisine et café |
| NatureForge | Arbres, buissons et végétation |
| Nature Megapack | Variété d’arbres et sous-bois |
| Farmland | Maison rurale, bâtiments agricoles, tracteur et champs |
| Stylized Rock Pack | Rochers, reliefs et galerie de la grotte |
| Roadside Tales — Backroad Bridges | Structures sous les deux tabliers de pont adaptés au terrain |
| Medieval Megapack | Hache et marteau génériques sur l’atelier, sans architecture médiévale |

`assets/openworld/manifest.json` indique les fichiers et archives d’origine, dépendances, dimensions et nombres de triangles. Les textures externes ont été relocalisées pour fonctionner en local. Les droits des packs restent ceux de leurs licences d’origine.

## Optimisation

Le monde est découpé en secteurs de 32 mètres. Deux chargements simultanés au maximum, distances adaptées à la qualité, déchargement des secteurs éloignés, géométries instanciées et cache de modèles à références évitent de charger tout le monde. Le rayon bas est de 72 mètres, avec une marge de déchargement pour éviter les rechargements incessants. Les modèles proches conservent leur géométrie. Les PNJ et créatures éloignés réduisent leur simulation et leur affichage. Les bibliothèques de chargement sont locales.

## Vérifications réalisées

- 33 tests automatisés réussis : sauvegardes, stockage, fabrication, cultures, combat, placement, escaliers, navigation, ressources, habitats, dépendances et expéditions.
- Scénarios dans le navigateur : nouvelle partie, transitions des menus, entrer/sortir, déplacer et annuler du mobilier, coffres et repos, reprise à l’étage, déplacement dans l’escalier, combat et 18 attaques.
- Pêche complète, échec anticipé, annulation, absence de récompense doublée et outils équipés avec le nouveau personnage.
- Perte puis restauration simulée du contexte graphique : partie conservée.
- Deux passages sur huit destinations éloignées : chargements terminés et aucune erreur JS ou de modèle signalée. Les relevés bruts sont fournis séparément. Ce sont des mesures ponctuelles sur PC, avec plusieurs vues de test, pas un benchmark de téléphone.
- Affichage 844 × 390 : panneau du carnet dans l’écran, pas de débordement horizontal de la page. Affichage 390 × 844 : invitation à tourner le téléphone.
- 223 entrées du cache hors ligne vérifiées présentes sur disque. Le fonctionnement sans réseau après installation n’a pas été testé sur téléphone.

La validation sur un Samsung S22 physique reste à faire, notamment température, autonomie, mémoire sur longue session et fluidité tactile. La carte comporte des intérieurs sélectionnés, une galerie rocheuse accessible et des activités jouables ; elle ne propose pas un intérieur unique pour chacun des 98 bâtiments.

Pour reproduire les vérifications, exécuter `node --test tests/*.test.mjs`. Pour les scénarios navigateur, démarrer `server.mjs` avec la variable d’environnement `PORT=4186`, puis ouvrir `/qa/gameplay.html`, attendre la fin du chargement et utiliser les boutons QA. Cette page crée des parties de test sur cette adresse. Le parcours de régions est disponible sur `http://localhost:4186/?qa=1`.

## Sauvegarde du travail

Copie intégrale avant modification : `C:\Users\cramo\Desktop\ambrelune-backup-20261009`. L’identité originale est également conservée dans `branding-original/`.

Le dépôt Git local contient l’état initial et la refonte sur la branche `refonte-open-world`. Aucun dépôt distant ni publication n’a été créé. Les tests utilisent le port 4186 pour isoler leurs sauvegardes de la partie habituelle sur 4173.

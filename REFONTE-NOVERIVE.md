# Noverive — refonte visuelle 0.5

## Jouer

Dans `C:\Users\cramo\Desktop\ambrelune`, ouvrir `Lancer-Noverive.cmd`. Le raccourci `Jouer-Noverive-v2.cmd` fourni dans les livrables ouvre directement cette version. Pour transporter le jeu, extraire `Noverive-Refonte-v2.zip` puis ouvrir `Lancer-Noverive.cmd` depuis le dossier extrait. Node.js doit être disponible ; le lanceur reconnaît aussi le runtime local déjà installé sur ce PC.

Les anciennes sauvegardes Ambrelune v1 et leur copie locale sont supprimées au chargement du jeu dans le navigateur concerné. La nouvelle progression utilise `noverive.save.v2`. Une sauvegarde de l'ancien projet et l'historique Git restent disponibles sur le PC.

## Ce qui a été reconstruit

Le monde mesure 2 048 × 2 048 mètres. La métropole occupe 768 × 672 mètres, organisée en îlots de 48 mètres et rues de 8 mètres. Le placement déterministe comprend 1 267 bâtiments, des quartiers résidentiels, commerces, tours, parcs, terrains de basket et halles. Les bâtiments et leur orientation sont adaptés aux rues ; deux familles du pack nécessitaient une correction de leur axe vertical.

La place d'arrivée est entièrement réaménagée : café à auvents, nouvelle fontaine avec jets animés, terrasse, bancs, arbres et jardinières remplies. Les pavés sont des matériaux continus à échelle réelle. Le domaine agricole, la forêt, le lac, la carrière, les crêtes, la grotte et la réserve remplacent l'ancienne carte. Le monde contient 11 415 emplacements de ressources accessibles. Les plantations, petites fleurs, buissons, cultures et accessoires sont chargés autour du joueur.

Le personnage, les variantes de PNJ, les outils, la canne, les maisons et leurs sols, fenêtres, escaliers, cuisine et mobilier ont été renouvelés. L'interface utilise une présentation claire et contemporaine. L'atlas représente la nouvelle géographie. Les monstres conservent leurs modèles et animations ; les systèmes de combat, capture, culture, fabrication, rangement et progression restent jouables.

Le catalogue regroupe les archives locales Cartoon City, Characters, Farm, Low Poly Nature, NatureForge, Stylized Rocks, Analog Memory, Restaurant et Medieval (outils génériques). Le monde extérieur utilise 71 références de décor, auxquelles s'ajoutent personnages, mobilier, outils et cultures. Les ponts sont une nouvelle construction géométrique ; le modèle Roadside Tales reste disponible dans le catalogue mais n'est pas utilisé dans cette version. Aucun téléchargement depuis le lien privé itch.io n'a été nécessaire.

## Vérification

- 34 tests automatiques réussis : sauvegardes, navigation, collisions, parcelle, cultures, fabrication, habitats, ressources, dépendances des modèles, combats et captures.
- Scénarios navigateur réussis : menus, entrer/sortir, placement et déplacement de meubles, annulation, coffre, repos, reprise à l'étage, montée et descente de l'escalier.
- Combat et 18 effets d'attaque, retour au monde sans erreur JavaScript.
- Pêche complète, annulation, échec anticipé, récompense unique et quatre outils équipés/animés.
- Deux parcours de huit régions en qualité moyenne puis basse : tous les secteurs demandés chargés, aucune erreur de modèle. Le rapport basse qualité est joint aux livrables.
- Interface mobile paysage vérifiée à 844 × 390, sans débordement horizontal ; inventaire compact et bouton de fermeture accessible. Pas d'essai sur un Galaxy S22 physique.
- 347 entrées du cache hors ligne contrôlées sur disque. Les bibliothèques et modèles sont locaux ; le fonctionnement réseau coupé n'a pas été simulé.

Les secteurs de 32 mètres se chargent par deux, les secteurs éloignés se libèrent, le cache des dispositions est limité à 512 secteurs et les modèles inutilisés sont évincés. Le mode bas limite la portée à 72 mètres et les détails proches ; moyenne 104 mètres, haute 136 mètres. La mesure sur ce PC ne vaut pas validation sur téléphone.

## Portée

Cette livraison est une refonte jouable du jeu existant, avec une nouvelle composition et des décors beaucoup plus denses. Elle ne constitue pas une production AAA de studio ni une reproduction exacte de la vidéo promotionnelle : pas de circulation automobile simulée à l'échelle de toute la ville, ni d'intérieur unique pour chacun des 1 267 bâtiments. Les scènes de combat utilisent une nouvelle clairière commune. Les futurs pouvoirs de terrain des compagnons ne sont pas un nouveau système jouable.

Les assets restent soumis aux licences de leurs auteurs. L'archive est destinée à votre usage avec les packs que vous possédez.

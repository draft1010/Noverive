# Corrections de cohérence — Noverive

- Voitures, taxis, camion de glaces et tracteur retirés des placements.
- Attache des outils corrigée sur la main droite réellement nommée par le chargeur de modèles.
- Bâtiments dimensionnés selon leur rotation ; café et maison des explorateurs remis entièrement dans leur îlot.
- Contrôle de l'emprise entière des bâtiments, végétaux, parcelles et objets contre les routes. Les ressources ramassables respectent aussi ces emprises.
- Route du domaine déviée à l'extérieur de la propriété. Maison, grange, silo et serre réunis dans une clôture Farm Pack, avec accès piéton.
- Parcelles jouables remplacées par les modèles Farm Pack, plantations supplémentaires, arbres du pack, panneau et boîte aux lettres.
- Classification précise des revêtements : la terre des chemins ne déborde plus sur la chaussée par interpolation.

Vérification : 39 tests réussis. Audit des 4 096 secteurs du monde ; contrôle des emprises et de l'absence de chevauchement entre les 1 265 bâtiments urbains. Contrôles visuels en navigateur de la ferme, des outils et des rues.

Le dossier d'assets contient Farm Pack Godot.zip et Farm Pack.zip. Aucun téléchargement complémentaire n'a été nécessaire pour ces corrections.

La version du cache a été actualisée. Recharger le jeu pour appliquer les corrections à une session déjà ouverte.

## Herbe et arrosage

Herbe enrichie par des variations de couleur et des touffes de brins en volume ; espaces de travail et voies conservés libres. Le couvert d'herbe utilise des instances légères.
La terre des parcelles fonce immédiatement à l'arrosage puis s'éclaircit avec le séchage. Le contour vert et les plantes restent inchangés. L'humidité peut être appliquée aux parcelles vides et reste conservée à la sauvegarde et à la plantation. La pluie humidifie aussi les parcelles vides et mûres.
41 tests réussis ; comparaison visuelle de parcelles sèches et humides dans le même éclairage, sans erreur de rendu dans le navigateur.

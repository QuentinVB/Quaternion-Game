# Quaternion-Game
Projet de jeu vidéo inspiré de PEZ dans le cadre du TP sur Bablyon JS à IN'TECH

## Critères du TP
- Avoir quelques objets 3D dans la scène avec caméra et lumière (créé via Babylon.js, Blender, à la main pour les mazos…) ✓
- Créer des matériaux et les appliquer aux objets ✓
- Au moins une action lors d’une interaction (clic sur un objet, etc.) ✓
- Mettre en place la physique et appliquer la physique à des objets ✓

## Assets requises
- level 0 map ✓
- level 1 map ✓
- cloud ✓
- ilot ✓
- plateforme ✓
- musique ✓

## Runs
1. setup serveur node de travail ✓
2. intégrer le niveau 0 ✓
3. création personnage et physique -> créer DES mesh par dessus le mesh initial ✓
4. gestion déplacement du personnage
- g/d = déplacement ✓
- haut = jump ✓+ limiteur ✓ 
- espace = action/changement dimension ✓
5. rotation caméra ✓
6. changement dimension ✓
- direction personnage ✓
- rotation selon le senseur -> selon la position du personnage ✓
7. détection levier
8. musique et son ✓
9. refonte graphique niveau 
- ground dead ✓
- checkpoint <- pseudo checkpoint ✓
- nuage et ilot aléatoires ✓
- skybox ✓
- masquer les ilots lorsqu'ils sont devant la camera + zone d'exclusion de spawn des ilots
10. intégrer niveau 1
11. loader : (remaining assets - promises chainé)
12. tuto pour le joueur   ✓
- "move" left+right arrow key  ✓
- "rotate" space key  ✓
- "jump" up arrow key  ✓
13. levelManager

trought the dark
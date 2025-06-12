# 📘 Documentation du module xcraft-core-placeholder

## Aperçu

Le module `xcraft-core-placeholder` est une bibliothèque utilitaire légère du framework Xcraft qui fournit un système de gestion de placeholders (espaces réservés) pour l'injection de valeurs dynamiques dans des chaînes de caractères ou des fichiers. Il permet de définir des variables nommées et de les remplacer dans des templates en utilisant une syntaxe de namespace structurée.

## Sommaire

- [Structure du module](#structure-du-module)
- [Fonctionnement global](#fonctionnement-global)
- [Exemples d'utilisation](#exemples-dutilisation)
- [Interactions avec d'autres modules](#interactions-avec-dautres-modules)
- [Détails des sources](#détails-des-sources)

## Structure du module

Le module expose deux éléments principaux :

- **`Placeholder`** : La classe principale pour créer des instances de gestionnaire de placeholders
- **`global`** : Une instance globale partagée de la classe Placeholder

La syntaxe des placeholders supporte :

- **Placeholders simples** : `<NAMESPACE.KEY>` ou `{NAMESPACE.KEY}`
- **Placeholders conditionnels** : `<NAMESPACE.KEY=value?true_value:false_value>`
- **Placeholders imbriqués** : Un placeholder peut contenir la référence à un autre placeholder

## Fonctionnement global

Le système fonctionne en trois étapes principales :

1. **Définition des valeurs** : Utilisation de `set(key, value)` pour associer des clés à des valeurs
2. **Résolution interne** : Le système résout automatiquement les références entre placeholders lors de l'injection
3. **Injection** : Remplacement des placeholders dans les données cibles avec `inject(namespace, data)`

Le module gère intelligemment :

- La résolution des dépendances entre placeholders avec protection contre les références circulaires
- Les objets complexes (transformation automatique en clés dotées)
- La compatibilité Windows pour les variables d'environnement (conversion en majuscules)
- L'échappement optionnel des backslashes pour les chemins de fichiers

## Exemples d'utilisation

### Utilisation basique avec l'instance globale

```javascript
const {global: ph} = require('xcraft-core-placeholder');

// Définir des valeurs
ph.set('APP_NAME', 'MonApplication').set('VERSION', '1.0.0');

// Injecter dans une chaîne
const template = 'Application: <CONFIG.APP_NAME> v<CONFIG.VERSION>';
const result = ph.inject('CONFIG', template);
// Résultat: "Application: MonApplication v1.0.0"
```

### Utilisation avec une instance dédiée

```javascript
const {Placeholder} = require('xcraft-core-placeholder');

const ph = new Placeholder();
ph.set('DATABASE_HOST', 'localhost').set('DATABASE_PORT', 5432);

const config = `
host: <DB.DATABASE_HOST>
port: <DB.DATABASE_PORT>
`;

const result = ph.inject('DB', config);
```

### Placeholders conditionnels

```javascript
const ph = new Placeholder();
ph.set('OS', 'darwin').set('PLATFORM', 'x64');

const template = 'Binary: app-<ENV.OS=darwin?macos:linux>-<ENV.PLATFORM>';
const result = ph.inject('ENV', template);
// Résultat: "Binary: app-macos-x64"
```

### Gestion d'objets complexes

```javascript
const ph = new Placeholder();
ph.set('COMPILER', {
  FLAGS: '-Os -fPIC',
  OPTIMIZATION: '-O2',
});

const makefile = `
CFLAGS = <BUILD.COMPILER.FLAGS> <BUILD.COMPILER.OPTIMIZATION>
`;

const result = ph.inject('BUILD', makefile);
// Résultat: "CFLAGS = -Os -fPIC -O2"
```

### Placeholders imbriqués

```javascript
const ph = new Placeholder();
ph.set('FOO.BAR', '<NS3.BAR.FOO>').set('BAR.FOO', 'foobar');

const template = 'Value: <NS3.FOO.BAR>';
const result = ph.inject('NS3', template);
// Résultat: "Value: foobar"
```

### Injection dans des fichiers

```javascript
const {global: ph} = require('xcraft-core-placeholder');

ph.set('PROJECT_NAME', 'MyProject').set('AUTHOR', 'John Doe');

// Traite template.txt et génère output.txt
ph.injectFile('META', './template.txt', './output.txt');
```

### Échappement des backslashes

```javascript
const ph = new Placeholder();
ph.set('PATH', 'C:\\Program Files\\MyApp');

const template = 'Installation path: <WIN.PATH>';
const result = ph.inject('WIN', template, true); // escape=true
// Résultat: "Installation path: C:\\\\Program Files\\\\MyApp"
```

## Interactions avec d'autres modules

Ce module est une bibliothèque utilitaire de base utilisée par d'autres composants du framework Xcraft pour :

- **Configuration dynamique** : Génération de fichiers de configuration à partir de templates
- **Scripts de build** : Injection de variables dans les scripts de compilation et makefiles
- **Templates de projet** : Création de nouveaux projets à partir de templates paramétrables
- **Variables d'environnement** : Gestion centralisée des variables système avec support spécial Windows
- **Génération de code** : Création de fichiers source à partir de templates

Il est particulièrement utilisé par les modules de génération et de configuration du framework Xcraft pour automatiser la création de fichiers de configuration et de build.

## Détails des sources

### `index.js`

Le fichier principal expose la classe `Placeholder` et une instance globale partagée.

#### Classe Placeholder

La classe principale qui gère le stockage et la résolution des placeholders.

**Propriétés :**

- `holders` : Objet stockant les paires clé-valeur des placeholders
- `_isResolved` : Booléen indiquant si les références internes ont été résolues pour le namespace courant

#### Méthodes publiques

- **`set(key, value)`** — Définit une valeur pour une clé donnée. Si la valeur est un objet, elle est automatiquement décomposée en clés dotées (ex: `{foo: {bar: 'value'}}` devient `foo.bar`). Gère spécialement les variables d'environnement Windows en convertissant les clés en majuscules quand `key === 'ENV'`. Retourne l'instance pour permettre le chaînage.

- **`inject(namespace, data, escape=false)`** — Remplace tous les placeholders du namespace spécifié dans les données fournies. Supporte les placeholders simples (`<NS.KEY>`, `{NS.KEY}`) et conditionnels (`<NS.KEY=val?true:false>`). Le paramètre `escape` permet d'échapper les backslashes dans les valeurs string. Résout automatiquement les références internes avant l'injection.

- **`injectFile(namespace, fileIn, fileOut)`** — Lit un fichier template depuis `fileIn`, y injecte les placeholders du namespace spécifié, puis écrit le résultat dans `fileOut`. Utilise l'encodage UTF-8 pour la lecture et l'écriture. Retourne l'instance pour permettre le chaînage.

#### Méthodes privées

- **`_resolve(namespace)`** — Résout les références internes entre placeholders pour le namespace donné. Parcourt tous les placeholders et remplace les références `<namespace.key>` par leurs valeurs correspondantes. Inclut une protection contre les références circulaires en détectant quand un placeholder se référence lui-même.

#### Gestion spéciale

Le module inclut plusieurs fonctionnalités spécialisées :

- **Support Windows** : Les variables d'environnement (`ENV`) sont automatiquement converties en majuscules sur Windows pour respecter la convention du système
- **Protection circulaire** : La méthode `_resolve` détecte et évite les références circulaires
- **Formats multiples** : Support des syntaxes `<>` et `{}` pour les placeholders
- **Échappement conditionnel** : Possibilité d'échapper les backslashes pour les chemins Windows

---

_Ce document a été mis à jour pour refléter l'état actuel du code source._
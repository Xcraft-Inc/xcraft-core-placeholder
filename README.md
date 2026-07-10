# 📘 xcraft-core-placeholder

## Aperçu

Le module `xcraft-core-placeholder` est une bibliothèque utilitaire légère du framework Xcraft qui fournit un système de gestion de placeholders (espaces réservés) pour l'injection de valeurs dynamiques dans des chaînes de caractères ou des fichiers. Il permet de définir des variables nommées, organisées par namespace, et de les substituer dans des templates textuels via une syntaxe dédiée, avec prise en charge des valeurs conditionnelles, des références imbriquées et du découpage de chaînes.

## Sommaire

- [Structure du module](#structure-du-module)
- [Fonctionnement global](#fonctionnement-global)
- [Exemples d'utilisation](#exemples-dutilisation)
- [Interactions avec d'autres modules](#interactions-avec-dautres-modules)
- [Détails des sources](#détails-des-sources)
- [Licence](#licence)

## Structure du module

Le module expose deux éléments principaux via `index.js` :

- **`Placeholder`** — La classe principale permettant de créer des instances indépendantes d'un gestionnaire de placeholders.
- **`global`** — Une instance partagée de `Placeholder`, prête à l'emploi pour un usage transversal dans une application sans devoir instancier explicitement la classe.

La syntaxe des placeholders supportée par `inject` est la suivante :

- **Placeholders simples** : `<NAMESPACE.CLE>` ou `{NAMESPACE.CLE}`.
- **Placeholders conditionnels** : `<NAMESPACE.CLE=valeur?valeur_si_vrai:valeur_si_faux>`.
- **Placeholders avec découpage** : `<NAMESPACE.CLE[separateur,index]>`, qui découpe la valeur associée à la clé selon un séparateur et n'en retient que le segment à l'index indiqué.
- **Placeholders imbriqués** : la valeur d'un placeholder peut elle-même contenir une référence à un autre placeholder (résolue avant l'injection).

## Fonctionnement global

Le cycle de vie d'une instance `Placeholder` se déroule en trois étapes :

1. **Définition des valeurs** — via `set(key, value)`, qui associe une clé à une valeur. Si la valeur est un objet, elle est automatiquement décomposée en clés à points (dot notation), par exemple `{BAR: '-Os -fPIC -g'}` défini sous la clé `FOO` devient la clé interne `FOO.BAR`.
2. **Résolution interne** — déclenchée automatiquement au premier appel à `inject` ou `injectFile` (ou après tout nouvel appel à `set`, qui invalide la résolution précédente via `_isResolved`). Elle remplace, au sein des valeurs stockées, les références internes du type `<namespace.cle>` par leur valeur correspondante, avec une protection contre l'auto-référence (un placeholder qui se référence lui-même n'est pas résolu, afin d'éviter une boucle infinie).
3. **Injection** — via `inject(namespace, data, escape)`, qui remplace dans `data` toutes les occurrences des placeholders du `namespace` donné :
   - d'abord les formes conditionnelles (`<NS.CLE=val?vrai:faux>`),
   - puis les formes simples, avec gestion optionnelle du découpage (`[separateur,index]`) et des deux syntaxes de délimiteurs `<>` et `{}`.

Le module gère également deux cas particuliers :

- **Windows et variables d'environnement** : lorsqu'une valeur objet est définie sous la clé `ENV` et que le processus tourne sous `win32`, les noms de variables sont automatiquement convertis en majuscules, l'environnement Windows étant insensible à la casse.
- **Échappement des backslashes** : le troisième paramètre `escape` de `inject`, lorsqu'il vaut `true`, double les antislashs présents dans les valeurs de type chaîne avant substitution, ce qui est utile pour insérer des chemins Windows dans un template sans casser l'échappement de celui-ci.

## Exemples d'utilisation

### Utilisation basique avec l'instance globale

```javascript
const {global: ph} = require('xcraft-core-placeholder');

ph.set('APP_NAME', 'MonApplication').set('VERSION', '1.0.0');

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

### Découpage d'une valeur (splitting)

```javascript
const ph = new Placeholder();
ph.set('VERSION', '1.2.3');

const template = 'Majeur: <APP.VERSION[.,0]> / Mineur: <APP.VERSION[.,1]>';
const result = ph.inject('APP', template);
// Résultat: "Majeur: 1 / Mineur: 2"
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

`xcraft-core-placeholder` est une bibliothèque utilitaire de bas niveau, sans dépendance vers d'autres modules Xcraft, mise à disposition des composants du framework pour :

- **Configuration dynamique** : génération de fichiers de configuration à partir de templates paramétrables.
- **Scripts de build** : injection de variables (chemins, flags de compilation, versions) dans des makefiles ou scripts de compilation.
- **Templates de projet** : création de nouveaux projets à partir de gabarits paramétrés.
- **Variables d'environnement** : gestion centralisée de valeurs système, avec adaptation automatique de la casse sous Windows.
- **Génération de code** : production de fichiers source à partir de modèles textuels.

Il est notamment exploité par les modules de génération et de configuration de l'écosystème Xcraft pour automatiser la création de fichiers de configuration et de build.

## Détails des sources

### `index.js`

Fichier unique du module, il expose la classe `Placeholder` ainsi qu'une instance globale partagée `global`.

#### Modèle interne

Chaque instance de `Placeholder` maintient :

- `holders` — un dictionnaire associant chaque clé (éventuellement préfixée en dot-notation pour les objets) à sa valeur.
- `_isResolved` — un indicateur booléen précisant si les références internes entre placeholders ont déjà été résolues pour l'état courant des `holders`. Il est remis à `false` à chaque appel à `set`, ce qui force une nouvelle résolution au prochain `inject`/`injectFile`.

#### Méthodes publiques

- **`set(key, value)`** — Définit une valeur pour une clé donnée. Si `value` est un objet, il est décomposé en clés à points (`{BAR: 'x'}` sous la clé `FOO` devient `FOO.BAR`). Cas particulier : si `key === 'ENV'` et que le processus tourne sous Windows (`process.platform === 'win32'`), les sous-clés sont converties en majuscules. Retourne l'instance courante pour permettre le chaînage.
- **`inject(namespace, data, escape=false)`** — Remplace dans `data` tous les placeholders appartenant au `namespace` donné. Prend en charge les formes conditionnelles (`<NS.CLE=val?vrai:faux>`), les formes simples avec les deux syntaxes `<>`/`{}`, ainsi que le découpage de valeur via `[separateur,index]`. Le paramètre `escape`, s'il vaut `true`, double les antislashs des valeurs de type chaîne avant substitution. Déclenche une résolution interne préalable si nécessaire. Retourne la chaîne transformée.
- **`injectFile(namespace, fileIn, fileOut)`** — Lit le fichier `fileIn` (encodage UTF-8), y applique `inject` pour le `namespace` donné, puis écrit le résultat dans `fileOut` (UTF-8). Retourne l'instance courante pour permettre le chaînage.

#### Méthodes privées

- **`_resolve(namespace)`** — Parcourt l'ensemble des `holders` et remplace, au sein de leurs valeurs, les références internes `<namespace.cle>` par la valeur correspondante lorsque celle-ci existe dans `holders`. Une clé qui se référence elle-même est ignorée afin d'éviter une boucle infinie de substitution. Marque ensuite l'instance comme résolue (`_isResolved = true`).

#### Particularités et cas limites

- **Compatibilité Windows** : la mise en majuscule automatique des sous-clés d'un objet `ENV` ne s'applique que sous `win32`, afin de respecter l'insensibilité à la casse des variables d'environnement de ce système.
- **Découpage de valeur** : la syntaxe `[separateur,index]` accolée à un placeholder (ex. `<NS.VERSION[.,0]>`) permet d'extraire un segment précis d'une valeur composite sans avoir à la redécouper manuellement en amont.
- **Double syntaxe de délimiteurs** : les formes `<...>` et `{...}` sont toutes deux acceptées pour un même placeholder, ce qui facilite l'usage dans des contextes où les chevrons sont déjà utilisés à d'autres fins (ex. templates HTML).
- **Protection contre les références circulaires** : uniquement partielle — seule l'auto-référence directe d'une clé vers elle-même est détectée et ignorée ; une boucle indirecte entre plusieurs clés n'est pas explicitement détectée par le code.

### `test/test.spec.js`

Suite de tests Mocha/Chai couvrant le comportement de `inject`, notamment : substitution simple, substitution avec plusieurs valeurs et plusieurs namespaces, résolution de placeholders imbriqués (y compris l'auto-référence), gestion des objets complexes, et découpage de valeur via la syntaxe `[separateur,index]`.

## Licence

Ce module est distribué sous [licence MIT](./LICENSE).

_Ce contenu a été généré par IA_

---

[xcraft-core-placeholder]: https://github.com/Xcraft-Inc/xcraft-core-placeholder

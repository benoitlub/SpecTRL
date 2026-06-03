# Modifier les résultats SpecTRL

Les phrases affichées par SpecTRL sont centralisées ici :

```txt
src/data/spectralTexts.ts
```

Ce fichier contient les textes des signatures principales :

- `crow` → Trace cognitive
- `pigeon` → Rémanence domestique
- `duck` → Parasite spectral mineur
- `cat` → Présence polie
- `dog` → Structure instable / Marty SLS candidate
- `owl` → Archive nocturne

## Ce que tu peux modifier sans danger

Dans chaque bloc, tu peux changer les phrases dans :

```ts
translations: L({
  fr: ["...", "..."],
  en: ["...", "..."],
  es: ["...", "..."],
})
```

Tu peux aussi modifier :

```ts
poetic
emotionalStates
biologicalIntents
neuralPatterns
environmentalScans
personality
```

## Règle simple

Garde toujours la structure :

```ts
fr: ["phrase 1", "phrase 2"],
en: ["sentence 1", "sentence 2"],
es: ["frase 1", "frase 2"],
```

Chaque phrase doit rester entre guillemets, séparée par une virgule.

## Exemple

Avant :

```ts
fr: ["La soupe refroidit encore. Ça devient un problème logistique."]
```

Après :

```ts
fr: ["La soupe refroidit depuis 1894. Marty refuse de conclure."]
```

## À éviter

Ne modifie pas encore :

```txt
src/hooks/useAudioAnalysis.ts
src/data/translations.ts
```

Ces fichiers contrôlent le moteur et les types. Marty y a laissé des câbles qui se ressemblent trop.

## Bon ton SpecTRL

Les résultats doivent rester :

- drôles,
- étranges,
- légèrement scientifiques,
- jamais présentés comme preuve paranormale,
- compatibles avec la règle : vraie captation, interprétation narrative.

Formules recommandées :

- `Signature détectée`
- `Rémanence possible`
- `Hypothèse Marty`
- `Structure instable`
- `Confiance scientifique faible`
- `Confiance Marty déraisonnable`

Formules à éviter :

- `Fantôme prouvé`
- `Entité confirmée`
- `Preuve scientifique`

## Phrase officielle de Marty

> Si ça réagit, ce n'est pas forcément vrai. Mais c'est déjà très intéressant.

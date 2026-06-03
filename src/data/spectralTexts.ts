import type { AnimalId } from "./animals";
import type { Lang } from "./translations";
import type { AnimalTextProfile } from "./animalTexts";

const L = <T extends Record<Lang, string[]>>(value: T) => value;

export const SPECTRAL_TEXTS: Record<AnimalId, AnimalTextProfile> = {
  crow: {
    personality: L({
      en: ["ARCHIVAL", "SUSPICIOUS", "MURMURING", "OBSESSIVE"],
      fr: ["ARCHIVISTE", "SUSPECT", "MARMONNEUR", "OBSESSIONNEL"],
      es: ["ARCHIVÍSTICO", "SOSPECHOSO", "MURMURADOR", "OBSESIVO"],
    }),
    emotionalStates: L({
      en: ["MEMORY PRESSURE", "QUIET FIXATION", "UNFINISHED THOUGHT"],
      fr: ["PRESSION MÉMORIELLE", "FIXATION SILENCIEUSE", "PENSÉE INACHEVÉE"],
      es: ["PRESIÓN DE MEMORIA", "FIJACIÓN SILENCIOSA", "PENSAMIENTO INACABADO"],
    }),
    threatLevels: ["LOW", "MODERATE", "LOW", "ELEVATED"],
    translations: L({
      en: [
        "I wrote it down somewhere. I always wrote everything down. Why can't I find the page?",
        "They moved the cabinet again. No one admits it, but I heard the wood complain.",
        "The wallpaper has a pattern. There is a message in it. I almost had it yesterday.",
        "Do not look at me. I am thinking. I was thinking before you came in."
      ],
      fr: [
        "Je l'avais noté quelque part. Je notais toujours tout. Pourquoi je ne retrouve pas la page ?",
        "Ils ont encore déplacé le meuble. Personne ne l'avoue, mais j'ai entendu le bois se plaindre.",
        "Le papier peint a un motif. Il y a un message dedans. Hier, j'y étais presque.",
        "Ne me regardez pas. Je réfléchis. Je réfléchissais déjà avant votre entrée."
      ],
      es: [
        "Lo apunté en alguna parte. Siempre lo apuntaba todo. ¿Por qué no encuentro la página?",
        "Volvieron a mover el mueble. Nadie lo admite, pero oí que la madera se quejaba.",
        "El papel pintado tiene un patrón. Hay un mensaje ahí. Ayer casi lo tenía.",
        "No me mires. Estoy pensando. Ya pensaba antes de que entraras."
      ],
    }),
    poetic: L({
      en: ["Some rooms keep lists no one remembers writing."],
      fr: ["Certaines pièces gardent des listes que personne ne se souvient d'avoir écrites."],
      es: ["Algunas habitaciones guardan listas que nadie recuerda haber escrito."],
    }),
    biologicalIntents: L({
      en: ["UNFINISHED INVENTORY", "WALL-PATTERN OBSESSION", "MEMORY LOOP"],
      fr: ["INVENTAIRE INACHEVÉ", "OBSESSION DU MOTIF MURAL", "BOUCLE MÉMORIELLE"],
      es: ["INVENTARIO INACABADO", "OBSESIÓN DEL PATRÓN DE PARED", "BUCLE DE MEMORIA"],
    }),
    neuralPatterns: ["TRACE_RECURSION", "ROOM_MEMORY_LEAK", "MARGIN_LOOP"],
    environmentalScans: L({
      en: ["WALL MEMORY: RESPONSIVE", "ARCHIVE DUST: ACTIVE", "MURMUR COHERENCE: HIGH"],
      fr: ["MÉMOIRE MURALE : RÉACTIVE", "POUSSIÈRE D'ARCHIVE : ACTIVE", "COHÉRENCE DU MURMURE : ÉLEVÉE"],
      es: ["MEMORIA DE PARED: REACTIVA", "POLVO DE ARCHIVO: ACTIVO", "COHERENCIA DEL MURMULLO: ALTA"],
    }),
  },

  pigeon: {
    personality: L({
      en: ["DOMESTIC", "DISTRACTED", "HABITUAL", "SOFTLY LOST"],
      fr: ["DOMESTIQUE", "DISTRAIT", "HABITUEL", "DOUCEMENT PERDU"],
      es: ["DOMÉSTICO", "DISTRAÍDO", "HABITUAL", "SUAVEMENTE PERDIDO"],
    }),
    emotionalStates: L({
      en: ["HALLWAY NOSTALGIA", "KITCHEN LOOP", "MILD WAITING"],
      fr: ["NOSTALGIE DE COULOIR", "BOUCLE DE CUISINE", "ATTENTE DOUCE"],
      es: ["NOSTALGIA DE PASILLO", "BUCLE DE COCINA", "ESPERA SUAVE"],
    }),
    threatLevels: ["MINIMAL", "LOW", "MINIMAL", "MODERATE"],
    translations: L({
      en: [
        "I put the keys near the bowl. Unless there was no bowl yet. Was there always a bowl?",
        "The soup must be cold now. I should go back. I should have gone back.",
        "Every evening I stop here. I don't know why. Maybe someone used to call my name.",
        "They changed the hallway smell. It used to know me."
      ],
      fr: [
        "J'avais posé les clés près du bol. À moins qu'il n'y ait pas encore de bol. Il y a toujours eu un bol ?",
        "La soupe doit être froide maintenant. Je devrais retourner voir. J'aurais dû retourner voir.",
        "Chaque soir je m'arrête ici. Je ne sais plus pourquoi. Peut-être qu'on m'appelait par mon prénom.",
        "Ils ont changé l'odeur du couloir. Avant, elle me reconnaissait."
      ],
      es: [
        "Dejé las llaves junto al cuenco. A menos que todavía no hubiera cuenco. ¿Siempre hubo un cuenco?",
        "La sopa ya debe estar fría. Debería volver. Debí haber vuelto.",
        "Cada tarde me detengo aquí. Ya no sé por qué. Quizá alguien decía mi nombre.",
        "Cambiaron el olor del pasillo. Antes me reconocía."
      ],
    }),
    poetic: L({
      en: ["A house keeps the shape of waiting."],
      fr: ["Une maison garde la forme de l'attente."],
      es: ["Una casa conserva la forma de la espera."],
    }),
    biologicalIntents: L({
      en: ["DOMESTIC ATTACHMENT", "UNFINISHED ERRAND", "HALLWAY RETURN"],
      fr: ["ATTACHEMENT DOMESTIQUE", "COURSE INACHEVÉE", "RETOUR AU COULOIR"],
      es: ["APEGO DOMÉSTICO", "RECAD0 INACABADO", "REGRESO AL PASILLO"],
    }),
    neuralPatterns: ["DOMESTIC_ECHO", "SOUP_LOOP", "HALLWAY_RESIDUE"],
    environmentalScans: L({
      en: ["FLOORBOARD MEMORY: WARM", "CORNER PRESENCE: LOW VOICE", "DRAFT SOURCE: UNDECIDED"],
      fr: ["MÉMOIRE DU PARQUET : TIÈDE", "PRÉSENCE DE COIN : VOIX BASSE", "COURANT D'AIR : INDÉCIS"],
      es: ["MEMORIA DEL SUELO: TIBIA", "PRESENCIA DE RINCÓN: VOZ BAJA", "CORRIENTE DE AIRE: INDECISA"],
    }),
  },

  duck: {
    personality: L({ en: ["FRAGMENTED", "NOISY", "ACCIDENTAL"], fr: ["FRAGMENTÉ", "BRUYANT", "ACCIDENTEL"], es: ["FRAGMENTADO", "RUIDOSO", "ACCIDENTAL"] }),
    emotionalStates: L({ en: ["STATIC CONFUSION", "BROKEN MEMORY", "PARASITE THOUGHT"], fr: ["CONFUSION STATIQUE", "SOUVENIR CASSÉ", "PENSÉE PARASITE"], es: ["CONFUSIÓN ESTÁTICA", "RECUERDO ROTO", "PENSAMIENTO PARÁSITO"] }),
    threatLevels: ["MINIMAL", "LOW", "MODERATE"],
    translations: L({
      en: [
        "No, that was not the sentence. It started with the window. Or the rain. Something with water.",
        "I keep hearing the pipe answer me. I know pipes do not answer. Usually.",
        "There was a knock. Three times. Unless I was the knock."
      ],
      fr: [
        "Non, ce n'était pas cette phrase. Ça commençait par la fenêtre. Ou par la pluie. Quelque chose avec de l'eau.",
        "J'entends encore le tuyau me répondre. Je sais que les tuyaux ne répondent pas. Normalement.",
        "On a frappé. Trois fois. À moins que ce soit moi, le coup."
      ],
      es: [
        "No, no era esa frase. Empezaba con la ventana. O con la lluvia. Algo con agua.",
        "Sigo oyendo que la tubería me contesta. Sé que las tuberías no contestan. Normalmente.",
        "Llamaron. Tres veces. A menos que yo fuera el golpe."
      ],
    }),
    poetic: L({ en: ["Static is a memory trying several doors."], fr: ["Le grésillement, c'est un souvenir qui essaie plusieurs portes."], es: ["La estática es un recuerdo probando varias puertas."] }),
    biologicalIntents: L({ en: ["INTERFERENCE DRIFT", "BROKEN SENTENCE", "PIPE RESPONSE"], fr: ["DÉRIVE D'INTERFÉRENCE", "PHRASE CASSÉE", "RÉPONSE DU TUYAU"], es: ["DERIVA DE INTERFERENCIA", "FRASE ROTA", "RESPUESTA DE TUBERÍA"] }),
    neuralPatterns: ["NOISE_BLOOM", "FALSE_DOOR", "STATIC_DRIFT"],
    environmentalScans: L({ en: ["STATIC FIELD: MURMURING", "PIPE HARMONICS: DETECTED", "SIGNAL CONTINUITY: FRACTURED"], fr: ["CHAMP STATIQUE : MURMURANT", "HARMONIQUES DE TUYAUX : DÉTECTÉES", "CONTINUITÉ DU SIGNAL : FRACTURÉE"], es: ["CAMPO ESTÁTICO: MURMURANDO", "ARMÓNICOS DE TUBERÍAS: DETECTADOS", "CONTINUIDAD DE SEÑAL: FRACTURADA"] }),
  },

  cat: {
    personality: L({ en: ["POLITE", "ABSENT", "WHISPERING"], fr: ["POLI", "ABSENT", "CHUCHOTANT"], es: ["EDUCADO", "AUSENTE", "SUSURRANTE"] }),
    emotionalStates: L({ en: ["COURTEOUS MELANCHOLY", "DISCREET PRESENCE", "GENTLE UNEASE"], fr: ["MÉLANCOLIE COURTOISE", "PRÉSENCE DISCRÈTE", "MALAISE DOUX"], es: ["MELANCOLÍA CORTÉS", "PRESENCIA DISCRETA", "INQUIETUD SUAVE"] }),
    threatLevels: ["LOW", "MODERATE", "LOW"],
    translations: L({
      en: [
        "I should not be in this room. I only came through because the door remembered me.",
        "Do they hear me when I apologize? I hope not. I have apologized enough.",
        "Someone is standing near the light. No, no one. I do that sometimes."
      ],
      fr: [
        "Je ne devrais pas être dans cette pièce. Je suis seulement passé parce que la porte se souvenait de moi.",
        "Est-ce qu'ils m'entendent quand je m'excuse ? J'espère que non. Je me suis assez excusé.",
        "Quelqu'un se tient près de la lumière. Non, personne. Je fais ça parfois."
      ],
      es: [
        "No debería estar en esta habitación. Solo pasé porque la puerta se acordaba de mí.",
        "¿Me oyen cuando pido perdón? Espero que no. Ya pedí perdón bastante.",
        "Hay alguien junto a la luz. No, nadie. A veces hago eso."
      ],
    }),
    poetic: L({ en: ["A presence can be an apology that never found the person."], fr: ["Une présence peut être une excuse qui n'a jamais trouvé la bonne personne."], es: ["Una presencia puede ser una disculpa que nunca encontró a la persona correcta."] }),
    biologicalIntents: L({ en: ["PARTIAL MATERIALIZATION", "POLITE HAUNTING", "DOOR MEMORY"], fr: ["MATÉRIALISATION PARTIELLE", "HANTISE POLIE", "MÉMOIRE DE PORTE"], es: ["MATERIALIZACIÓN PARCIAL", "ENCANTO EDUCADO", "MEMORIA DE PUERTA"] }),
    neuralPatterns: ["POLITE_SIGNAL", "PARTIAL_LOCK", "DOOR_MEMORY"],
    environmentalScans: L({ en: ["PRESENCE: APOLOGETIC", "VISIBILITY: OPTIONAL", "FORMALITY INDEX: HIGH"], fr: ["PRÉSENCE : EXCUSÉE", "VISIBILITÉ : OPTIONNELLE", "INDICE DE FORMALITÉ : ÉLEVÉ"], es: ["PRESENCIA: DISCULPÁNDOSE", "VISIBILIDAD: OPCIONAL", "ÍNDICE DE FORMALIDAD: ALTO"] }),
  },

  dog: {
    personality: L({ en: ["UNSTABLE", "VISUAL", "UNSURE"], fr: ["INSTABLE", "VISUEL", "INCERTAIN"], es: ["INESTABLE", "VISUAL", "INSEGURO"] }),
    emotionalStates: L({ en: ["POSE CONFUSION", "BODY MEMORY", "HUMANOID DOUBT"], fr: ["CONFUSION POSTURALE", "MÉMOIRE DU CORPS", "DOUTE HUMANOÏDE"], es: ["CONFUSIÓN POSTURAL", "MEMORIA DEL CUERPO", "DUDA HUMANOIDE"] }),
    threatLevels: ["MINIMAL", "LOW", "MODERATE"],
    translations: L({
      en: [
        "My arms should be here. Or lower. Did I always stand like this?",
        "The chair looks tired. I know that feeling. I used to sit there without meaning to.",
        "If I stay very still, maybe the room will remember my shape."
      ],
      fr: [
        "Mes bras devraient être ici. Ou plus bas. Est-ce que je me tenais toujours comme ça ?",
        "La chaise a l'air fatiguée. Je connais ça. Avant, je m'asseyais là sans y penser.",
        "Si je reste très immobile, peut-être que la pièce se souviendra de ma forme."
      ],
      es: [
        "Mis brazos deberían estar aquí. O más abajo. ¿Siempre me paraba así?",
        "La silla parece cansada. Conozco esa sensación. Antes me sentaba ahí sin pensarlo.",
        "Si me quedo muy quieto, quizá la habitación recuerde mi forma."
      ],
    }),
    poetic: L({ en: ["A silhouette is a habit the air has not abandoned."], fr: ["Une silhouette est une habitude que l'air n'a pas abandonnée."], es: ["Una silueta es un hábito que el aire no abandonó."] }),
    biologicalIntents: L({ en: ["POSE MEMORY", "SHAPE RESIDUE", "CHAIR ATTACHMENT"], fr: ["MÉMOIRE DE POSTURE", "RÉSIDU DE FORME", "ATTACHEMENT À LA CHAISE"], es: ["MEMORIA DE POSTURA", "RESIDUO DE FORMA", "APEGO A LA SILLA"] }),
    neuralPatterns: ["SLS_PRELOCK", "POSE_GHOSTING", "SHAPE_RESIDUE"],
    environmentalScans: L({ en: ["VISUAL LAYER: PENDING", "ELBOW HYPOTHESIS: UNVERIFIED", "POSTURE COHERENCE: LOW"], fr: ["COUCHE VISUELLE : EN ATTENTE", "HYPOTHÈSE COUDE : NON VÉRIFIÉE", "COHÉRENCE POSTURALE : FAIBLE"], es: ["CAPA VISUAL: PENDIENTE", "HIPÓTESIS DE CODO: NO VERIFICADA", "COHERENCIA POSTURAL: BAJA"] }),
  },

  owl: {
    personality: L({ en: ["NOCTURNAL", "CRYPTIC", "PATIENT"], fr: ["NOCTURNE", "CRYPTIQUE", "PATIENT"], es: ["NOCTURNO", "CRÍPTICO", "PACIENTE"] }),
    emotionalStates: L({ en: ["TIMELESS OBSERVATION", "SILENT JUDGMENT", "OLD-HOUSE PATIENCE"], fr: ["OBSERVATION INTEMPORELLE", "JUGEMENT SILENCIEUX", "PATIENCE DE VIEILLE MAISON"], es: ["OBSERVACIÓN ATEMPORAL", "JUICIO SILENCIOSO", "PACIENCIA DE CASA ANTIGUA"] }),
    threatLevels: ["LOW", "ELEVATED", "CRITICAL"],
    translations: L({
      en: [
        "The floor knows more than it says. It creaks only when no one deserves the answer.",
        "Three nights ago something changed. I counted it twice. The hallway pretended not to notice.",
        "They think silence is empty. That is how silence keeps everything."
      ],
      fr: [
        "Le plancher sait plus de choses qu'il n'en dit. Il craque seulement quand personne ne mérite la réponse.",
        "Quelque chose a changé il y a trois nuits. Je l'ai compté deux fois. Le couloir a fait semblant de ne rien voir.",
        "Ils pensent que le silence est vide. C'est comme ça que le silence garde tout."
      ],
      es: [
        "El suelo sabe más de lo que dice. Solo cruje cuando nadie merece la respuesta.",
        "Algo cambió hace tres noches. Lo conté dos veces. El pasillo fingió no notarlo.",
        "Creen que el silencio está vacío. Así es como el silencio lo guarda todo."
      ],
    }),
    poetic: L({ en: ["Silence is an archive without a receptionist."], fr: ["Le silence est une archive sans réceptionniste."], es: ["El silencio es un archivo sin recepcionista."] }),
    biologicalIntents: L({ en: ["NOCTURNAL ARCHIVE", "OLD PATTERN RECOGNITION"], fr: ["ARCHIVE NOCTURNE", "RECONNAISSANCE DE VIEUX SCHÉMAS"], es: ["ARCHIVO NOCTURNO", "RECONOCIMIENTO DE PATRONES ANTIGUOS"] }),
    neuralPatterns: ["NIGHT_ARCHIVE", "SILENCE_INDEX", "FLOORBOARD_ORACLE"],
    environmentalScans: L({ en: ["NIGHT SECTOR: RESPONSIVE", "FLOOR MEMORY: ACTIVE", "SILENCE DENSITY: HIGH"], fr: ["SECTEUR NOCTURNE : RÉACTIF", "MÉMOIRE DU PLANCHER : ACTIVE", "DENSITÉ DU SILENCE : ÉLEVÉE"], es: ["SECTOR NOCTURNO: REACTIVO", "MEMORIA DEL SUELO: ACTIVA", "DENSIDAD DEL SILENCIO: ALTA"] }),
  },
};

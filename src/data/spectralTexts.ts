import type { AnimalId } from "./animals";
import type { Lang } from "./translations";
import type { AnimalTextProfile } from "./animalTexts";

const L = <T extends Record<Lang, string[]>>(value: T) => value;

export const SPECTRAL_TEXTS: Record<AnimalId, AnimalTextProfile> = {
  crow: {
    personality: L({
      en: ["SUSPICIOUS", "ARCHIVAL", "HYPER-OBSERVANT", "MARTY-COMPATIBLE"],
      fr: ["SUSPECT", "ARCHIVISTE", "HYPER-OBSERVATEUR", "COMPATIBLE MARTY"],
      es: ["SOSPECHOSO", "ARCHIVÍSTICO", "HIPER-OBSERVADOR", "COMPATIBLE CON MARTY"],
    }),
    emotionalStates: L({
      en: ["QUIET SURVEILLANCE", "MEMORY PRESSURE", "ADMINISTRATIVE DOUBT"],
      fr: ["SURVEILLANCE SILENCIEUSE", "PRESSION MÉMORIELLE", "DOUTE ADMINISTRATIF"],
      es: ["VIGILANCIA SILENCIOSA", "PRESIÓN DE MEMORIA", "DUDA ADMINISTRATIVA"],
    }),
    threatLevels: ["LOW", "MODERATE", "LOW", "ELEVATED"],
    translations: L({
      en: ["I am not a ghost. I am a recurring note in the room's margin.", "Someone knew too much here. The wallpaper still remembers.", "Marty says I count as a detection. I find this flattering and legally fragile.", "Do not move the chair. It has finally achieved emotional stability."],
      fr: ["Je ne suis pas un fantôme. Je suis une note récurrente dans la marge de la pièce.", "Quelqu'un en savait trop ici. Le papier peint s'en souvient encore.", "Marty dit que je compte comme une détection. C'est flatteur et juridiquement fragile.", "Ne bougez pas la chaise. Elle vient enfin d'atteindre une stabilité émotionnelle."],
      es: ["No soy un fantasma. Soy una nota recurrente en el margen de la habitación.", "Alguien sabía demasiado aquí. El papel pintado todavía lo recuerda.", "Marty dice que cuento como detección. Es halagador y legalmente frágil.", "No muevas la silla. Por fin alcanzó estabilidad emocional."],
    }),
    poetic: L({
      en: ["Some rooms do not forget. They only lower the volume."],
      fr: ["Certaines pièces n'oublient pas. Elles baissent seulement le volume."],
      es: ["Algunas habitaciones no olvidan. Solo bajan el volumen."],
    }),
    biologicalIntents: L({
      en: ["MEMORY TRIANGULATION", "CHAIR-BASED SUSPICION", "ARCHIVE LEAK"],
      fr: ["TRIANGULATION MÉMORIELLE", "SUSPICION BASÉE SUR UNE CHAISE", "FUITE D'ARCHIVE"],
      es: ["TRIANGULACIÓN DE MEMORIA", "SOSPECHA BASADA EN SILLA", "FUGA DE ARCHIVO"],
    }),
    neuralPatterns: ["TRACE_RECURSION", "MARTY_LOCK", "ROOM_MEMORY_LEAK"],
    environmentalScans: L({
      en: ["ARCHIVE DUST: ACTIVE", "WALL MEMORY: RESPONSIVE", "MARTY CONFIDENCE: UNREASONABLE"],
      fr: ["POUSSIÈRE D'ARCHIVE : ACTIVE", "MÉMOIRE MURALE : RÉACTIVE", "CONFIANCE MARTY : DÉRAISONNABLE"],
      es: ["POLVO DE ARCHIVO: ACTIVO", "MEMORIA DE PARED: REACTIVA", "CONFIANZA MARTY: IRRAZONABLE"],
    }),
  },

  pigeon: {
    personality: L({
      en: ["DOMESTIC", "CONFUSED", "POLITE", "LIGHTLY HAUNTED"],
      fr: ["DOMESTIQUE", "CONFUS", "POLI", "LÉGÈREMENT HANTÉ"],
      es: ["DOMÉSTICO", "CONFUSO", "EDUCADO", "LIGERAMENTE ENCANTADO"],
    }),
    emotionalStates: L({
      en: ["HALLWAY NOSTALGIA", "SOUP-RELATED CONCERN", "MILD AFTERLIFE DELAY"],
      fr: ["NOSTALGIE DE COULOIR", "INQUIÉTUDE LIÉE À LA SOUPE", "RETARD LÉGER DANS L'AU-DELÀ"],
      es: ["NOSTALGIA DE PASILLO", "PREOCUPACIÓN POR SOPA", "RETRASO LEVE DEL MÁS ALLÁ"],
    }),
    threatLevels: ["MINIMAL", "LOW", "MINIMAL", "MODERATE"],
    translations: L({
      en: ["I was waiting for someone, but I may have confused the century.", "The soup is still cooling. This is becoming a logistical issue.", "I haunt this corner because the acoustics are excellent.", "Please stop calling me an entity. I prefer persistent domestic impression."],
      fr: ["J'attendais quelqu'un, mais j'ai peut-être confondu le siècle.", "La soupe refroidit encore. Ça devient un problème logistique.", "Je hante ce coin parce que l'acoustique est excellente.", "Merci de ne pas m'appeler entité. Je préfère impression domestique persistante."],
      es: ["Estaba esperando a alguien, pero quizá confundí el siglo.", "La sopa todavía se enfría. Esto ya es un problema logístico.", "Encanto este rincón porque la acústica es excelente.", "Por favor no me llames entidad. Prefiero impresión doméstica persistente."],
    }),
    poetic: L({
      en: ["A house keeps its breath in the corners."],
      fr: ["Une maison garde son souffle dans les coins."],
      es: ["Una casa guarda su aliento en las esquinas."],
    }),
    biologicalIntents: L({
      en: ["DOMESTIC ATTACHMENT", "UNFINISHED ERRAND", "CORRIDOR LOITERING"],
      fr: ["ATTACHEMENT DOMESTIQUE", "COURSE INACHEVÉE", "STATIONNEMENT DE COULOIR"],
      es: ["APEGO DOMÉSTICO", "RECAD0 INACABADO", "MERODEO DE PASILLO"],
    }),
    neuralPatterns: ["DOMESTIC_ECHO", "SOUP_LOOP", "HALLWAY_RESIDUE"],
    environmentalScans: L({
      en: ["FLOORBOARD MEMORY: WARM", "CORNER PRESENCE: POLITE", "DRAFT SOURCE: SUSPICIOUS"],
      fr: ["MÉMOIRE DU PARQUET : TIÈDE", "PRÉSENCE DE COIN : POLIE", "COURANT D'AIR : SUSPECT"],
      es: ["MEMORIA DEL SUELO: TIBIA", "PRESENCIA DE RINCÓN: EDUCADA", "CORRIENTE DE AIRE: SOSPECHOSA"],
    }),
  },

  duck: {
    personality: L({ en: ["GLITCHY", "NOISY", "OVERINTERPRETED"], fr: ["GLITCHÉ", "BRUYANT", "SURINTERPRÉTÉ"], es: ["GLITCHEADO", "RUIDOSO", "SOBREINTERPRETADO"] }),
    emotionalStates: L({ en: ["STATIC EXCITEMENT", "SENSOR CONFUSION", "PARASITE HUMOUR"], fr: ["EXCITATION STATIQUE", "CONFUSION CAPTEUR", "HUMOUR PARASITE"], es: ["EXCITACIÓN ESTÁTICA", "CONFUSIÓN DE SENSOR", "HUMOR PARÁSITO"] }),
    threatLevels: ["MINIMAL", "LOW", "MODERATE"],
    translations: L({
      en: ["I am probably interference, but I have chosen to be mysterious.", "Marty classified a refrigerator noise as emotionally complex. I support him.", "There is a signal here. It may be plumbing. Plumbing has feelings too."],
      fr: ["Je suis probablement une interférence, mais j'ai choisi d'être mystérieuse.", "Marty a classé un bruit de frigo comme émotionnellement complexe. Je le soutiens.", "Il y a un signal ici. C'est peut-être la plomberie. La plomberie a aussi des sentiments."],
      es: ["Probablemente soy interferencia, pero decidí ser misteriosa.", "Marty clasificó un ruido de nevera como emocionalmente complejo. Lo apoyo.", "Hay una señal aquí. Puede ser la fontanería. La fontanería también siente."],
    }),
    poetic: L({ en: ["Static is the universe coughing politely."], fr: ["Le grésillement, c'est l'univers qui tousse poliment."], es: ["La estática es el universo tosiendo con educación."] }),
    biologicalIntents: L({ en: ["INTERFERENCE DRIFT", "FALSE POSITIVE CELEBRATION"], fr: ["DÉRIVE D'INTERFÉRENCE", "CÉLÉBRATION DU FAUX POSITIF"], es: ["DERIVA DE INTERFERENCIA", "CELEBRACIÓN DEL FALSO POSITIVO"] }),
    neuralPatterns: ["NOISE_BLOOM", "FALSE_POSITIVE_JOY", "STATIC_DRIFT"],
    environmentalScans: L({ en: ["STATIC FIELD: PLAYFUL", "PIPE HARMONICS: DETECTED", "MARTY NOTE: COUNTS ANYWAY"], fr: ["CHAMP STATIQUE : JOUEUR", "HARMONIQUES DE TUYAUX : DÉTECTÉES", "NOTE MARTY : ÇA COMPTE QUAND MÊME"], es: ["CAMPO ESTÁTICO: JUGUETÓN", "ARMÓNICOS DE TUBERÍAS: DETECTADOS", "NOTA DE MARTY: CUENTA IGUAL"] }),
  },

  cat: {
    personality: L({ en: ["POLITE", "ABSENT", "SLIGHTLY FORMAL"], fr: ["POLI", "ABSENT", "LÉGÈREMENT FORMEL"], es: ["EDUCADO", "AUSENTE", "LIGERAMENTE FORMAL"] }),
    emotionalStates: L({ en: ["COURTEOUS MELANCHOLY", "DISCREET PRESENCE", "GENTLE UNEASE"], fr: ["MÉLANCOLIE COURTOISE", "PRÉSENCE DISCRÈTE", "MALAISE DOUX"], es: ["MELANCOLÍA CORTÉS", "PRESENCIA DISCRETA", "INQUIETUD SUAVE"] }),
    threatLevels: ["LOW", "MODERATE", "LOW"],
    translations: L({
      en: ["Excuse me. I seem to be lingering in the wrong decade.", "I did not mean to appear in the sensor. I was passing through the idea of a corridor.", "Please note that I am only partially present and fully embarrassed."],
      fr: ["Excusez-moi. Il semble que je traîne dans la mauvaise décennie.", "Je ne voulais pas apparaître dans le capteur. Je traversais l'idée d'un couloir.", "Merci de noter que je suis partiellement présent et complètement gêné."],
      es: ["Disculpa. Parece que estoy demorándome en la década equivocada.", "No quise aparecer en el sensor. Solo cruzaba la idea de un pasillo.", "Por favor conste que estoy parcialmente presente y totalmente avergonzado."],
    }),
    poetic: L({ en: ["A presence can be a question that forgot its answer."], fr: ["Une présence peut être une question qui a oublié sa réponse."], es: ["Una presencia puede ser una pregunta que olvidó su respuesta."] }),
    biologicalIntents: L({ en: ["PARTIAL MATERIALIZATION", "POLITE HAUNTING", "CORRIDOR IDEA TRANSIT"], fr: ["MATÉRIALISATION PARTIELLE", "HANTISE POLIE", "TRANSIT D'IDÉE DE COULOIR"], es: ["MATERIALIZACIÓN PARCIAL", "ENCANTO EDUCADO", "TRÁNSITO DE IDEA DE PASILLO"] }),
    neuralPatterns: ["POLITE_SIGNAL", "PARTIAL_LOCK", "CORRIDOR_IDEA"],
    environmentalScans: L({ en: ["PRESENCE: APOLOGETIC", "VISIBILITY: OPTIONAL", "FORMALITY INDEX: HIGH"], fr: ["PRÉSENCE : EXCUSÉE", "VISIBILITÉ : OPTIONNELLE", "INDICE DE FORMALITÉ : ÉLEVÉ"], es: ["PRESENCIA: DISCULPÁNDOSE", "VISIBILIDAD: OPCIONAL", "ÍNDICE DE FORMALIDAD: ALTO"] }),
  },

  dog: {
    personality: L({ en: ["UNSTABLE", "VISUAL", "OVERCONFIDENT"], fr: ["INSTABLE", "VISUEL", "TROP CONFIANT"], es: ["INESTABLE", "VISUAL", "DEMASIADO CONFIADO"] }),
    emotionalStates: L({ en: ["SKELETAL OPTIMISM", "POSE CONFUSION", "HUMANOID DOUBT"], fr: ["OPTIMISME SQUELETTIQUE", "CONFUSION POSTURALE", "DOUTE HUMANOÏDE"], es: ["OPTIMISMO ESQUELÉTICO", "CONFUSIÓN POSTURAL", "DUDA HUMANOIDE"] }),
    threatLevels: ["MINIMAL", "LOW", "MODERATE"],
    translations: L({
      en: ["The camera thinks I have elbows. We are all very excited.", "This coat rack has achieved suspicious posture coherence.", "Humanoid structure detected. Legs: theoretical. Confidence: Marty."],
      fr: ["La caméra pense que j'ai des coudes. Nous sommes tous très émus.", "Ce porte-manteau vient d'atteindre une cohérence posturale suspecte.", "Structure humanoïde détectée. Jambes : théoriques. Confiance : Marty."],
      es: ["La cámara cree que tengo codos. Estamos todos muy emocionados.", "Este perchero alcanzó una coherencia postural sospechosa.", "Estructura humanoide detectada. Piernas: teóricas. Confianza: Marty."],
    }),
    poetic: L({ en: ["A stick figure is what remains when certainty leaves the room."], fr: ["Un bonhomme bâton, c'est ce qui reste quand la certitude quitte la pièce."], es: ["Un muñeco de palitos es lo que queda cuando la certeza sale de la habitación."] }),
    biologicalIntents: L({ en: ["MARTY_SLS_CANDIDATE", "POSE COHERENCE TEST", "COAT_RACK_NEGOTIATION"], fr: ["CANDIDAT_MARTY_SLS", "TEST DE COHÉRENCE POSTURALE", "NÉGOCIATION_AVEC_PORTE_MANTEAU"], es: ["CANDIDATO_MARTY_SLS", "PRUEBA DE COHERENCIA POSTURAL", "NEGOCIACIÓN_CON_PERCHERO"] }),
    neuralPatterns: ["SLS_PRELOCK", "POSE_GHOSTING", "ELBOW_HYPOTHESIS"],
    environmentalScans: L({ en: ["VISUAL LAYER: PENDING", "ELBOW HYPOTHESIS: UNVERIFIED", "COAT RACK: TOO CALM"], fr: ["COUCHE VISUELLE : EN ATTENTE", "HYPOTHÈSE COUDE : NON VÉRIFIÉE", "PORTE-MANTEAU : TROP CALME"], es: ["CAPA VISUAL: PENDIENTE", "HIPÓTESIS DE CODO: NO VERIFICADA", "PERCHERO: DEMASIADO CALMO"] }),
  },

  owl: {
    personality: L({ en: ["NOCTURNAL", "CRYPTIC", "ARCHIVAL"], fr: ["NOCTURNE", "CRYPTIQUE", "ARCHIVISTE"], es: ["NOCTURNO", "CRÍPTICO", "ARCHIVÍSTICO"] }),
    emotionalStates: L({ en: ["TIMELESS OBSERVATION", "SILENT JUDGMENT", "OLD-HOUSE PATIENCE"], fr: ["OBSERVATION INTEMPORELLE", "JUGEMENT SILENCIEUX", "PATIENCE DE VIEILLE MAISON"], es: ["OBSERVACIÓN ATEMPORAL", "JUICIO SILENCIOSO", "PACIENCIA DE CASA ANTIGUA"] }),
    threatLevels: ["LOW", "ELEVATED", "CRITICAL"],
    translations: L({
      en: ["I have heard this floor complain since before your router was born.", "The darkness contains data. Marty printed it and immediately lost the page.", "Something changed three nights ago. The hallway refuses to elaborate."],
      fr: ["J'entends ce plancher se plaindre depuis avant la naissance de votre routeur.", "L'obscurité contient des données. Marty les a imprimées puis a perdu la feuille.", "Quelque chose a changé il y a trois nuits. Le couloir refuse de préciser."],
      es: ["Oigo que este suelo se queja desde antes de que naciera tu router.", "La oscuridad contiene datos. Marty los imprimió y perdió la hoja enseguida.", "Algo cambió hace tres noches. El pasillo se niega a dar detalles."],
    }),
    poetic: L({ en: ["Silence is not empty. It is an archive without a receptionist."], fr: ["Le silence n'est pas vide. C'est une archive sans réceptionniste."], es: ["El silencio no está vacío. Es un archivo sin recepcionista."] }),
    biologicalIntents: L({ en: ["NOCTURNAL ARCHIVE ACCESS", "OLD PATTERN RECOGNITION"], fr: ["ACCÈS AUX ARCHIVES NOCTURNES", "RECONNAISSANCE DE VIEUX SCHÉMAS"], es: ["ACCESO A ARCHIVO NOCTURNO", "RECONOCIMIENTO DE PATRONES ANTIGUOS"] }),
    neuralPatterns: ["NIGHT_ARCHIVE", "TEMPORAL_ECHO_SAFE", "SILENCE_INDEX"],
    environmentalScans: L({ en: ["NIGHT SECTOR: RESPONSIVE", "FLOOR MEMORY: ACTIVE", "SILENCE DENSITY: HIGH"], fr: ["SECTEUR NOCTURNE : RÉACTIF", "MÉMOIRE DU PLANCHER : ACTIVE", "DENSITÉ DU SILENCE : ÉLEVÉE"], es: ["SECTOR NOCTURNO: REACTIVO", "MEMORIA DEL SUELO: ACTIVA", "DENSIDAD DEL SILENCIO: ALTA"] }),
  },
};

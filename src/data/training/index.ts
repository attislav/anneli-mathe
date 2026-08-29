// Dispatcher für die Trainings-Generatoren.
//
// Eine Zeile pro Modul — wenn ein Modul dazukommt, meckert TypeScript hier,
// solange kein Generator verdrahtet ist (exhaustive switch).

import type { TrainingModuleId } from "./modules";
import type { Level, TrainingTask } from "./types";
import { generateZahlenfreunde } from "./generators/zahlenfreunde";
import { generateBis20 } from "./generators/bis20";
import { generateZehnersprung } from "./generators/zehnersprung";
import { generateVerdoppeln } from "./generators/verdoppeln";
import { generateVolleZehner } from "./generators/volleZehner";
import { generateBis100 } from "./generators/bis100";
import { generateFastZehner } from "./generators/fastZehner";
import { generateEinmaleins, generateEinmaleinsKern } from "./generators/einmaleins";
import { generateTeilen } from "./generators/teilen";

export type { TrainingTask, Level } from "./types";
export {
  TRAINING_MODULES,
  getTrainingModule,
  nextTrainingModule,
  type TrainingModule,
  type TrainingModuleId,
  type Trick,
  type Accent,
} from "./modules";

export function generateTrainingTask(
  moduleId: TrainingModuleId,
  level: Level = "normal"
): TrainingTask {
  switch (moduleId) {
    case "zahlenfreunde":
      return generateZahlenfreunde(level);
    case "bis20":
      return generateBis20(level);
    case "zehnersprung":
      return generateZehnersprung(level);
    case "verdoppeln":
      return generateVerdoppeln(level);
    case "volle-zehner":
      return generateVolleZehner(level);
    case "bis100":
      return generateBis100(level);
    case "fast-zehner":
      return generateFastZehner(level);
    case "einmaleins-kern":
      return generateEinmaleinsKern(level);
    case "einmaleins":
      return generateEinmaleins(level);
    case "teilen":
      return generateTeilen(level);
    default: {
      const _exhaustive: never = moduleId;
      throw new Error(`generateTrainingTask: unbekanntes Modul ${String(_exhaustive)}`);
    }
  }
}

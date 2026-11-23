import { useState, type ReactNode } from "react";
import { basketSolutions, calendarDates, fitsViews, goods, ruleLabel } from "@/game/discovery";
import type { BasketTask, CalendarTask, CubeTask, EstimateTask, MachineTask } from "@/game/types";
import { Button } from "@/ui/Button";
import { NumPad } from "./NumPad";
import type { FormatProps } from "./formats";

const card = "grid gap-2 rounded-3xl bg-white p-4 text-center";
const number = "font-display text-2xl";

function ChooseThenCalculate({
  options,
  right,
  question,
  answer,
  locked,
  hint,
  numberHint,
  onAnswer,
  children,
  suppliedRule = false,
}: {
  options: string[];
  right: string;
  question: string;
  answer: number;
  locked: boolean;
  hint: string;
  numberHint: string;
  onAnswer: FormatProps<MachineTask>["onAnswer"];
  children?: ReactNode;
  suppliedRule?: boolean;
}) {
  const [chosen, setChosen] = useState(suppliedRule);
  const [entry, setEntry] = useState("");
  return (
    <div className="grid gap-3">
      {children}
      {chosen ? (
        <>
          <p className={card}>
            {question}
            <output className={number}>{entry || "?"}</output>
          </p>
          <NumPad
            value={entry}
            onChange={setEntry}
            disabled={locked}
            onOk={() => onAnswer(Number(entry) === answer, numberHint)}
          />
        </>
      ) : (
        options.map((option) => (
          <Button
            key={option}
            tone="white"
            className="min-h-16 h-auto py-3"
            disabled={locked}
            onClick={() => (option === right ? setChosen(true) : onAnswer(false, hint))}
          >
            {option}
          </Button>
        ))
      )}
    </div>
  );
}

export function MachineView({ task, status, onAnswer }: FormatProps<MachineTask>) {
  return (
    <ChooseThenCalculate
      options={task.rules.map(ruleLabel)}
      right={ruleLabel(task.change)}
      locked={status !== "ask"}
      onAnswer={onAnswer}
      suppliedRule={task.level === 1}
      hint={task.hint}
      numberHint={
        task.reverse ? "Rechne von der Ausgabe aus mit der umgekehrten Regel zurück." : "Wende die Regel auf die neue Eingabe an."
      }
      question={
        task.reverse
          ? `Regel ${ruleLabel(task.change)}. Heraus kommt ${task.probe + task.change}. Was ging hinein?`
          : `Regel ${ruleLabel(task.change)}. Hinein geht ${task.probe}. Was kommt heraus?`
      }
      answer={task.reverse ? task.probe : task.probe + task.change}
    >
      <table className="w-full rounded-3xl bg-white text-center">
        <thead>
          <tr>
            <th>Hinein</th>
            <th>Heraus</th>
          </tr>
        </thead>
        <tbody>
          {task.inputs.map((n) => (
            <tr key={n} className={number}>
              <td>{n}</td>
              <td>{n + task.change}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ChooseThenCalculate>
  );
}

export function EstimateView({ task, status, onAnswer }: FormatProps<EstimateTask>) {
  return (
    <ChooseThenCalculate
      options={task.reasons}
      right={task.reason}
      question={`Wie lang ist das Band am Ende? Antworte in ${task.unit}.`}
      answer={task.answer}
      hint={task.hint}
      numberHint={`Deine Begründung passt. Rechne jetzt ${task.calculation}.`}
      locked={status !== "ask"}
      onAnswer={onAnswer}
    />
  );
}

function CubePicture({ heights }: { heights: number[] }) {
  return (
    <svg viewBox="0 0 152 132" className="mx-auto h-32" role="img" aria-label="Dein Würfelbauwerk">
      {[0, 1, 2, 3].map((i) => {
        const x = 76 + 29 * ((i % 2) - Math.floor(i / 2));
        const y = 72 + 14 * ((i % 2) + Math.floor(i / 2));
        return (
          <g key={i} transform={`translate(${x} ${y})`} stroke="#494579" strokeLinejoin="round">
            <polygon points="0,0 29,14 0,28 -29,14" fill="#e9e5f6" />
            {Array.from({ length: heights[i] }, (_, z) => (
              <g key={z} transform={`translate(0 ${-20 * (z + 1)})`}>
                <polygon points="-29,14 0,28 0,48 -29,34" fill="#9178df" />
                <polygon points="0,28 29,14 29,34 0,48" fill="#6852af" />
                <polygon points="0,0 29,14 0,28 -29,14" fill="#d5c7ff" />
              </g>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

export function CubeView({ task, status, onAnswer }: FormatProps<CubeTask>) {
  const [heights, setHeights] = useState([0, 0, 0, 0]);
  const locked = status !== "ask";
  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-2 gap-2">
        <div className={card}>
          <b>Von oben</b>
          <div
            className="m-auto grid grid-cols-2 gap-1"
            role="img"
            aria-label={`Belegte Felder: ${task.footprint
              .map((on, i) => (on ? ["hinten links", "hinten rechts", "vorne links", "vorne rechts"][i] : ""))
              .filter(Boolean)
              .join(", ")}`}
          >
            {task.footprint.map((on, i) => (
              <span key={i} className={`h-7 w-7 rounded border ${on ? "bg-violet-500" : "bg-white"}`} />
            ))}
          </div>
        </div>
        <div className={card}>
          <b>Von vorne</b>
          <div
            className="mx-auto flex items-end gap-1"
            role="img"
            aria-label={`Höhe links ${task.front[0]}, rechts ${task.front[1]}`}
          >
            {task.front.map((n, i) => (
              <div key={i} className="grid">
                {Array.from({ length: n }, (_, j) => (
                  <span key={j} className="h-5 w-5 border border-violet-800 bg-violet-400" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={card}>
        <CubePicture heights={heights} />
        <p>Tippe auf ein Feld: 0 → 1 → 2 → 3 → 0 Würfel.</p>
        <div className="mx-auto grid grid-cols-2 gap-2">
          {heights.map((h, i) => (
            <Button
              key={i}
              tone="white"
              size="md"
              disabled={locked}
              aria-label={`${i < 2 ? "Hinten" : "Vorne"} ${i % 2 ? "rechts" : "links"}: ${h} Würfel`}
              onClick={() => setHeights(heights.map((old, j) => (j === i ? (old + 1) % 4 : old)))}
            >
              {h}
            </Button>
          ))}
        </div>
        <small>Vorderkante</small>
      </div>
      <Button
        disabled={locked || !heights.some(Boolean)}
        onClick={() =>
          onAnswer(
            fitsViews(task, heights),
            heights.some((h, i) => h > 0 !== task.footprint[i])
              ? "Vergleiche zuerst die belegten Felder mit der Draufsicht."
              : "Die Felder stimmen. Prüfe jetzt den höchsten Turm links und rechts.",
          )
        }
      >
        Bauwerk prüfen
      </Button>
    </div>
  );
}

export function BasketView({ task, status, onAnswer }: FormatProps<BasketTask>) {
  const [counts, setCounts] = useState([0, 0, 0]);
  const [found, setFound] = useState<number[][]>([]);
  const [notice, setNotice] = useState("");
  const goal = basketSolutions(task).length;
  const total = counts.reduce((sum, n, i) => sum + n * task.prices[i], 0);
  const locked = status !== "ask";
  function adjust(i: number, delta: number) {
    setNotice("");
    setCounts(counts.map((n, j) => (j === i ? n + delta : n)));
  }
  function check() {
    if (total !== task.budget)
      return onAnswer(
        false,
        `Dein Korb kostet ${total} ct. ${total > task.budget ? "Nimm etwas heraus." : "Lege noch etwas dazu."}`,
      );
    if (found.some((b) => b.every((n, i) => n === counts[i]))) {
      setNotice("Diesen Korb hast du schon. Verändere die Mengen.");
      return;
    }
    setFound([...found, counts]);
    setCounts([0, 0, 0]);
    setNotice("");
    if (found.length + 1 === goal) onAnswer(true);
  }
  return (
    <div className="grid gap-3">
      <div className={card}>
        {goods.map((item, i) => (
          <div key={item} className="flex items-center justify-between gap-2">
            <span>
              {item} · {task.prices[i]} ct
            </span>
            <div className="flex items-center gap-3">
              <Button
                tone="white"
                size="md"
                disabled={locked || !counts[i]}
                aria-label={item + " wegnehmen"}
                onClick={() => adjust(i, -1)}
              >
                −
              </Button>
              <output>{counts[i]}</output>
              <Button
                tone="white"
                size="md"
                disabled={locked || counts[i] >= Math.floor(task.budget / task.prices[i])}
                aria-label={item + " hinzufügen"}
                onClick={() => adjust(i, 1)}
              >
                +
              </Button>
            </div>
          </div>
        ))}
        <strong className={number}>{total} ct</strong>
      </div>
      <Button disabled={locked || !total} onClick={check}>
        Korb prüfen
      </Button>
      <div aria-live="polite" className={card}>
        <b>
          {found.length} von {goal} Körben
        </b>
        {found.map((b) => (
          <p key={b.join("-")}>
            {b
              .map((n, i) => (n ? `${n} × ${goods[i]}` : ""))
              .filter(Boolean)
              .join(" + ")}
          </p>
        ))}
        {notice && <p>{notice}</p>}
      </div>
    </div>
  );
}

const monthLabel = new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric", timeZone: "UTC" });
export function CalendarView({ task, status, onAnswer }: FormatProps<CalendarTask>) {
  const [marked, setMarked] = useState(false);
  const [entry, setEntry] = useState("");
  const { start, end } = calendarDates(task);
  const months = [new Date(Date.UTC(task.year, task.month, 1))];
  if (start.getUTCMonth() !== end.getUTCMonth()) months.push(new Date(Date.UTC(task.year, task.month + 1, 1)));
  const locked = status !== "ask";
  return (
    <div className="grid gap-3">
      {months.map((month) => {
        const year = month.getUTCFullYear(),
          m = month.getUTCMonth();
        const length = new Date(Date.UTC(year, m + 1, 0)).getUTCDate();
        const offset = (month.getUTCDay() + 6) % 7;
        return (
          <div key={m} className={card}>
            <b>{monthLabel.format(month)}</b>
            <div className="grid grid-cols-7 gap-1">
              {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((d) => (
                <b key={d}>{d}</b>
              ))}
              {Array.from({ length: offset }, (_, i) => (
                <span key={"space" + i} />
              ))}
              {Array.from({ length }, (_, i) => {
                const day = i + 1,
                  today = m === task.month && day === task.day,
                  target = m === end.getUTCMonth() && day === end.getUTCDate();
                return (
                  <button
                    key={day}
                    disabled={locked || marked}
                    aria-label={`${day}. ${monthLabel.format(month)}${today ? ", heute" : ""}`}
                    className={`min-h-11 rounded-lg border font-semibold ${today ? "border-grape bg-grape/10" : (marked || status === "reveal") && target ? "bg-green-200" : "bg-white"}`}
                    onClick={() => (target ? setMarked(true) : onAnswer(false, task.hint))}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      {marked && (
        <>
          <p className="text-center font-bold">
            Wie oft schläfst du bis zum Ausflug? <output>{entry || "?"}</output>
          </p>
          <NumPad
            value={entry}
            onChange={setEntry}
            disabled={locked}
            onOk={() =>
              onAnswer(
                Number(entry) === task.nights,
                "Zähle jeden Wechsel von einem Tag zum nächsten. Heute ist der Start bei null.",
              )
            }
          />
        </>
      )}
    </div>
  );
}

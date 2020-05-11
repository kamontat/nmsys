import { ThrowState, ThrowStateType } from "./state";
import { isDevelopment } from "@nmsys/lib-utils";
import DigitialConverter, { Unit } from "./utils/converter/digital";
import { Paths } from "./utils/filesystem/path";

export interface ThrowableStack {
  path: Paths;
  typename: string | null;
  linenum: number | null;
  colmnum: number | null;
  funcname: string | null;
  method: string | null;
}

export default class Throwable extends Error {
  static build(state: ThrowState, message?: string): Throwable {
    return new Throwable(state.code, state.name, message, undefined, state.type === ThrowStateType.WARN ? false : true);
  }

  static from<E extends Error>(error: E, deadly = true): Throwable {
    if (error instanceof Throwable) return error;
    return new Throwable(-1, error.name, error.message, error.stack, deadly);
  }

  private readonly _stack: ThrowableStack[];
  private readonly memory: NodeJS.MemoryUsage;

  constructor(
    private readonly code: number,
    name?: string,
    message?: string,
    stack?: string,
    private readonly deadly: boolean = true,
  ) {
    super(message ?? "something went wrong");
    this.memory = process.memoryUsage();

    const obj = { stack: [] };

    const orig = Error.prepareStackTrace; // save original prepare method
    Error.prepareStackTrace = (_, stack) => stack;
    Error.captureStackTrace(obj, Throwable);
    const rawStack: NodeJS.CallSite[] = obj.stack as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    Error.prepareStackTrace = orig; // revert original method

    // Lets make our JSON object.
    this._stack = [];
    for (const frame of rawStack) {
      this._stack.push({
        path: new Paths(frame.getFileName()),
        typename: frame.getTypeName(),
        linenum: frame.getLineNumber(),
        colmnum: frame.getColumnNumber(),
        funcname: frame.getFunctionName(),
        method: frame.getMethodName(),
      });
    }

    if (name) this.name = name;
    if (stack) this.stack = stack;
  }

  get needsExit() {
    return this.deadly;
  }

  get errcode() {
    return this.code;
  }

  get formatted() {
    if (isDevelopment()) return this.getDevelopmentFormatted;
    else return this.getProductionFormatted;
  }

  private conv(s: number, to: Unit) {
    return DigitialConverter(s, Unit.Byte).to(to);
  }

  private getMemory(to: Unit) {
    return {
      used: this.conv(this.memory.heapUsed, to),
      total: this.conv(this.memory.heapTotal, to),
      percentage: (this.memory.heapUsed / this.memory.heapTotal) * 100,
    };
  }

  private get getDevelopmentFormatted() {
    const memory = this.getMemory(Unit.Megabyte);

    let msg = `${this.name}(${this.errcode}): ${this.message}\n`;
    msg += `    mem: ${memory.percentage.toFixed(1)}% (used=${memory.used.toFixed(2)}MB, total=${memory.total.toFixed(
      2,
    )}MB)\n`;

    msg += `    stacks:\n`;
    msg += `${this._stack
      .map((s) => {
        const typename = s.typename ? s.typename + "." : "";
        const funcname = s.funcname ?? s.method ?? "<anonymous>";

        const name = `${typename}${funcname}`.padEnd(30, " ");

        const registry = /registry\.npmjs\.org/;
        const extLibName = `<${s.path.after(registry, 1)}>/${s.path.filename}`;
        const intLibName = `<${s.path.after(/nmsys/, 2)}>/${s.path.after(/end/, 3)}/${s.path.filename}`;

        const filename = s.path.includes(registry) ? extLibName : intLibName;

        return `      - ${name} ${filename}:${s.linenum}:${s.colmnum}`;
      })
      .join("\n")}`;

    return msg;
  }

  private get getProductionFormatted() {
    const memory = this.getMemory(Unit.Megabyte);
    return `${this.name}(${this.errcode}): ${this.message} ${memory.percentage.toFixed(1)}% (used=${memory.used.toFixed(
      2,
    )}MB, total=${memory.total.toFixed(2)}MB)`;
  }

  equals(e: Throwable) {
    return e.code === this.code && e.message === this.message;
  }

  toString() {
    return this.formatted;
  }
}

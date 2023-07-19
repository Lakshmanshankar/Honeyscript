import { MK_BOOL, MK_NULL, RuntimeVal } from "./values.ts";

export function createGlobalEnv() {
  const env = new Environment();
  env.declare("true", MK_BOOL(true), true);
  env.declare("false", MK_BOOL(false), true);
  env.declare("null", MK_NULL(), true);
  return env;
}

export class Environment {
  private parent?: Environment;
  private variables: Map<string, RuntimeVal>;
  private constants: Set<string>;
  constructor(parentEnv?: Environment) {
    this.parent = parentEnv;
    this.variables = new Map();
    this.constants = new Set();
  }

  // variables[varname] = value but we have to check it has be already declared
  // each env has own this.variables so do need to check env for resolving
  public declare(varname: string, value: RuntimeVal, isConstant: boolean) {
    if (this.variables.has(varname)) {
      this.envError(`Cannot redeclare ${varname} already declared`);
    }
    this.variables.set(varname, value);
    if (isConstant) {
      this.constants.add(varname);
    }
    return value;
  }

  // assign the value for the last Environment which varname has been declared
  public assign(varname: string, value: RuntimeVal): RuntimeVal {
    const env = this.resolve(varname);
    if (this.constants.has(varname)) {
      this.envError(`Cannot redeclare constant ${varname}`);
    }
    env.variables.set(varname, value);
    return value;
  }

  private envError(errMsg: string) {
    throw `🐯 Environment error \n: ${errMsg}`;
  }

  public resolve(varname: string): Environment {
    if (this.variables.has(varname)) {
      return this;
    }
    if (this.parent == undefined) {
      throw `Cannot resolve '${varname}' as it does not exist.`;
    }
    return this.parent.resolve(varname);
  }

  // get a value from the last declared Environment
  public lookup(varname: string): RuntimeVal {
    const env = this.resolve(varname);
    return env.variables.get(varname) as RuntimeVal;
  }
}

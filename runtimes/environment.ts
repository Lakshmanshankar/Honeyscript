import {
  MK_BOOL,
  MK_NATIVE_FN,
  MK_NULL,
  MK_STRING,
  RuntimeVal,
} from "./values.ts";

export function createGlobalEnv() {
  const env = new Environment();
  env.declare("true", MK_BOOL(true), true);
  env.declare("false", MK_BOOL(false), true);
  env.declare("null", MK_NULL(), true);

  // support for native functions
  env.declare(
    "print",
    MK_NATIVE_FN((args, env) => {
      console.log(...args);
      return MK_NULL();
    }),
    true,
  );

  env.declare(
    "version",
    MK_NATIVE_FN((args, env) => {
      console.log(
        "\x1b[1;96m ----------------------------------------------------------\x1b[0m",
      );
      console.log(
        "\x1b[1;96m|                                                         |\x1b[0m",
      );
      console.log(
        "|               \x1b[33m🍯 Honey\x1b[0m\x1b[38;5;202mscript: v0.1 🐬\x1b[0m                   |",
      );
      console.log(
        "\x1b[1;96m|                                                         |\x1b[0m",
      );
      console.log(
        "\x1b[1;96m ----------------------------------------------------------\x1b[0m",
      );
      console.log(
        "|   \x1b[1;96m2023 © Lakshmanshankar C All rights are reserved\x1b[0m      |",
      );

      console.log(
        "\x1b[1;96m ----------------------------------------------------------\x1b[0m",
      );
      return MK_NULL();
    }),
    true,
  );

  const mitLicense = `MIT License

Copyright (c) 2023 Lakshmanshankarc

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

[Include the full text of the MIT License here]
`;
  env.declare(
    "license",
    MK_STRING(mitLicense),
    true,
  );
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

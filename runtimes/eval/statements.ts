import {
  FunctionDeclaration,
  Program,
  VarDeclaration,
} from "../../core/ast.ts";
import { Environment } from "../environment.ts";
import { evaluate } from "../interpreter.ts";
import { FunctionVal, MK_NULL, RuntimeVal } from "../values.ts";

// eval each statement then return the result of last eval statement
export function eval_program(program: Program, env: Environment): RuntimeVal {
  let last_eval: RuntimeVal = MK_NULL();
  for (const stmt of program.body) {
    last_eval = evaluate(stmt, env);
  }
  return last_eval;
}

/**
 * we just need to evaluate the value for the declaration.value then
 * declare it with the current scope already givet to us with the
 * env:Environment parameter
 *
 * one Catch compute value only if we have value cus
 * let x; may not contain a value but may be assigned later so currently null
 */
export function eval_var_declaration(
  declaration: VarDeclaration,
  env: Environment,
): RuntimeVal {
  const value = declaration.value
    ? evaluate(declaration.value, env)
    : MK_NULL();
  return env.declare(
    declaration.identifier,
    value,
    declaration.constant,
  ) as RuntimeVal;
}

export function eval_fn_declaration(
  declaration: FunctionDeclaration,
  env: Environment,
): RuntimeVal {
  const func: FunctionVal = {
    type: "function",
    name: declaration.name,
    parameters: declaration.parameters,
    declarationEnv: env,
    body: declaration.body,
  };

  return env.declare(declaration.name, func, false);
}

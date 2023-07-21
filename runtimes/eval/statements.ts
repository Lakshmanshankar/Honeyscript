import {
  BlockStmt,
  FunctionDeclaration,
  IfStatement,
  Program,
  VarDeclaration,
WhileStatement,
} from "../../core/ast.ts";
import { Environment } from "../environment.ts";
import { evaluate } from "../interpreter.ts";
import { BooleanVal, FunctionVal, MK_NULL, RuntimeVal } from "../values.ts";

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

export function eval_if_statement(
  ifStmt: IfStatement,
  env: Environment,
): RuntimeVal {
  const testResult = evaluate(ifStmt.testExpr, env) as BooleanVal; // Evaluate the testExpr

  // WARNING: the testExpr may not neccessarily the BinaryExpr it
  // can also be any value handle that with a separate function (when ?)
  if (testResult.type !== "boolean") {
    throw new Error("Condition in if statement must evaluate to a boolean.");
  }

  if (testResult.value) {
    // If the condition is true, evaluate the consquent block
    return eval_block(ifStmt.consquent, env);
  } else if (ifStmt.alternate) {
    // If the condition is false and there's an alternate block, evaluate it
    return eval_block(ifStmt.alternate, env);
  } else {
    // If the condition is false and there's no alternate block, return null
    return MK_NULL();
  }
}

function eval_block(block: BlockStmt, env: Environment): RuntimeVal {
  let result: RuntimeVal = MK_NULL();

  for (const statement of block.body) {
    result = evaluate(statement, env);
  }

  return result;
}


export function eval_while_statement(
  whileStmt:WhileStatement,
  env:Environment
):RuntimeVal {
  while (true) {
    const testExpr = evaluate(whileStmt.testExpr, env) as BooleanVal;

    if (!testExpr.value) {
      // If the test expression is falsy, break the loop
      return MK_NULL();
    }

    // Evaluate the consequent block
    eval_block(whileStmt.consquent, env);
  }
}
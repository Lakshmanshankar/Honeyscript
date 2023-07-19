import {
  AssignmentExpr,
  BinaryExpr,
  IdentifierLiteral,
  ObjectExpr,
} from "../../core/ast.ts";
import { Environment } from "../environment.ts";
import { evaluate } from "../interpreter.ts";
import {
  MK_NULL,
  MK_NUM,
  NumberVal,
  ObjectVal,
  RuntimeVal,
} from "../values.ts";

export function eval_binary_expr(
  binOp: BinaryExpr,
  env: Environment,
): RuntimeVal {
  const lhs = evaluate(binOp.left, env);
  const rhs = evaluate(binOp.right, env);

  if (lhs.type == "number" && rhs.type == "number") {
    return eval_numeric_bin_expr(
      lhs as NumberVal,
      rhs as NumberVal,
      binOp.operator,
    );
  }
  return MK_NULL();
}
// because its like a helper func for eval_binary_expr
export function eval_numeric_bin_expr(
  left: NumberVal,
  right: NumberVal,
  operator: string,
): RuntimeVal {
  let result = 0;
  if (operator == "+") result = left.value + right.value;
  else if (operator == "-") result = left.value - right.value;
  else if (operator == "*") result = left.value * right.value;
  else if (operator == "/") {
    if (right.value == 0) throw "🐬 : Cannot Divide By Zero da";
    result = left.value / right.value;
  } else result = left.value % right.value;
  return MK_NUM(result);
}

export function eval_identifier(
  ident: IdentifierLiteral,
  env: Environment,
): RuntimeVal {
  const val = env.lookup(ident.symbol);
  return val;
}

export function eval_assignment_expr(
  node: AssignmentExpr,
  env: Environment,
): RuntimeVal {
  if (node.assignee.kind !== "IdentifierLiteral") {
    throw `Assignee for ${
      JSON.stringify(node.assignee)
    } is Not IdentifierLiteral`;
  }
  const identifer = (node.assignee as IdentifierLiteral).symbol;
  return env.assign(identifer, evaluate(node.value, env));
}

export function eval_object_expr(
  obj: ObjectExpr,
  env: Environment,
): RuntimeVal {
  const object = { type: "object" } as ObjectVal;
  for (const { key, value } of obj.properties) {
    const runtimeValforvalue = (value == undefined)
      ? env.lookup(key)
      : evaluate(value, env);

    object.properties.set(key, runtimeValforvalue);
  }
  return object;
}

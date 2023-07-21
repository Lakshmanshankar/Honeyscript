import {
  ArrayLiteral,
  AssignmentExpr,
  BinaryExpr,
  CallExpr,
  IdentifierLiteral,
  ObjectExpr,
  StringLiteral,
} from "../../core/ast.ts";
import { Environment } from "../environment.ts";
import { evaluate } from "../interpreter.ts";
import {
  ArrayVal,
  FunctionVal,
  MK_BOOL,
  MK_NULL,
  MK_NUM,
  MK_STRING,
  NativeFnVal,
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

  if (binOp.operator === "<") {
    if (lhs.type === "number" && rhs.type === "number") {
      return MK_BOOL((lhs as NumberVal).value < (rhs as NumberVal).value);
    } else {
      throw "🔥 Relational operators require numeric operands";
    }
  } else if (binOp.operator === ">") {
    if (lhs.type === "number" && rhs.type === "number") {
      return MK_BOOL((lhs as NumberVal).value > (rhs as NumberVal).value);
    } else {
      throw "🔥 Relational operators require numeric operands";
    }
  } else if (lhs.type === "number" && rhs.type === "number") {
    // Handle other arithmetic operators here if you add them in the future
    return eval_numeric_bin_expr(
      lhs as NumberVal,
      rhs as NumberVal,
      binOp.operator,
    );
  } else {
    return MK_NULL();
  }
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
  const object = { type: "object", properties: new Map() } as ObjectVal;
  for (const { key, value } of obj.properties) {
    const runtimeValforvalue = (value == undefined)
      ? env.lookup(key)
      : evaluate(value, env);

    object.properties.set(key, runtimeValforvalue);
  }
  return object;
}

export function eval_array_expr(
  arr: ArrayLiteral,
  env: Environment,
) {
  const array = { type: "array", elements: [] } as ArrayVal;
  for (const value of arr.elements) {
    array.elements.push(evaluate(value, env));
  }
  return array;
}

export function eval_string_expr(
  str: StringLiteral,
): RuntimeVal {
  return MK_STRING(str.value);
}

export function eval_call_expr(
  expr: CallExpr,
  env: Environment,
): RuntimeVal {
  // here we evaluate the arguments
  const args = expr.args.map((arg) => evaluate(arg, env));

  // here we evaluate the caller which is a function so we can call it
  const fn = evaluate(expr.caller, env) as NativeFnVal;
  if (fn.type === "native-fn") {
    return fn.call(args, env);
  }
  if (fn.type === "function") {
    const func = fn as unknown as FunctionVal;
    // this will create a closure for the variables decalred inside of the function
    const scope = new Environment(func.declarationEnv);
    // NOTE: About Parmeteres and arguments
    //Now we can assign the parameters to the scope but before that there is one catch
    //We need to check that the args passed to this CallExpr should matchup with the no of parameters that the
    //function takes

    // WARNING: This will not accurately validate the args with parameters
    if (isArgsValidForParams(args, func.parameters)) {
      for (let i = 0; i < func.parameters.length; i++) {
        scope.declare(func.parameters[i], args[i], false);
      }
    }

    // Now we set all the env for the current func Block eval the body itself
    let fnReturnVal: RuntimeVal = MK_NULL(); // func () blocks may be empty;
    for (const stmt of func.body) {
      fnReturnVal = evaluate(stmt, scope);
    }
    return fnReturnVal;
  }

  throw `🐬 : ${expr.caller} is not a function`;
  // here we call the function with the arguments
}

function isArgsValidForParams(args: RuntimeVal[], parameters: string[]) {
  return args.length === parameters.length;
}

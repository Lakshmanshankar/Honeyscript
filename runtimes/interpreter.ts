/**
 * ----------------------------------------------------
 *|                                                   |
 *| ===================INTERPRETER====================|
 *|                                                   |
 * ----------------------------------------------------
  | 1. This will Evaluate the Program Node            |
  | 2. creates runtime Values that are Mostly ready   |
  | to execute                                        |
 * ----------------------------------------------------
 */

import {
  ArrayLiteral,
  AssignmentExpr,
  BinaryExpr,
  IdentifierLiteral,
  NumberLiteral,
  ObjectExpr,
  Program,
  Stmt,
  StringLiteral,
  VarDeclaration,
} from "../core/ast.ts";
import { Environment } from "./environment.ts";
import {
  eval_array_expr,
  eval_assignment_expr,
  eval_binary_expr,
  eval_identifier,
  eval_object_expr,
  eval_string_expr,
} from "./eval/expressions.ts";
import { eval_program, eval_var_declaration } from "./eval/statements.ts";
import { NumberVal, RuntimeVal } from "./values.ts";

// this will parse every node in the AST then returns a Runtime Value which is the result
// This of this like a parse_primary_expr returns primary RuntimeValues for other eval functions
// env is The current Scope which is Global for first evaluate on main.ts
export function evaluate(astNode: Stmt, env: Environment): RuntimeVal {
  switch (astNode.kind) {
    case "NumberLiteral":
      return {
        type: "number",
        value: (astNode as NumberLiteral).value,
      } as NumberVal;

    case "Program":
      return eval_program(astNode as Program, env); // firstcase to be invoked

    case "IdentifierLiteral":
      return eval_identifier(astNode as IdentifierLiteral, env); // firstcase to be invoked

    case "BinaryExpr":
      return eval_binary_expr(astNode as BinaryExpr, env);

    case "AssignmentExpr":
      return eval_assignment_expr(astNode as AssignmentExpr, env);

    case "VarDeclaration":
      return eval_var_declaration(astNode as VarDeclaration, env);

    case "ObjectExpr":
      return eval_object_expr(astNode as ObjectExpr, env);

    case "StringLiteral":
      return eval_string_expr(astNode as StringLiteral);
    case "ArrayLiteral":
      return eval_array_expr(astNode as ArrayLiteral, env);
    default:
      console.error(
        `☢️ : This ASTNode is Currently Not Supported ${
          JSON.stringify(astNode)
        }`,
      );
      Deno.exit();
  }
}

// Now we know that both left and right are Numbners so we can do tha arithmetic

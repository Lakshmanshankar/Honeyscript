// deno-lint-ignore-file no-empty-interface
export type NodeType =
  // Program
  | "Program"
  | "VarDeclaration"
  // Expr
  | "BinaryExpr"
  | "AssignmentExpr"
  | "CallExpr"
  | "MemberExpr"
  // Literal
  | "NumberLiteral"
  | "StringLiteral"
  | "ArrayLiteral"
  | "ObjectExpr" // ObjectExpr is actually ObjectLiteral I cannot Rename it now
  | "Property"
  | "IdentifierLiteral";
export interface Stmt {
  kind: NodeType;
}

export interface Program extends Stmt {
  kind: "Program";
  body: Stmt[];
}

export interface Expr extends Stmt {}

export interface BinaryExpr extends Expr {
  kind: "BinaryExpr";
  left: Expr;
  right: Expr;
  operator: string;
}

// assignee is  not just a string because we support more complex operations  like
// for.bar or  foo[bar] = Expr; so 🐥
export interface AssignmentExpr extends Expr {
  kind: "AssignmentExpr";
  assignee: Expr;
  value: Expr;
}
// VarDeclaration are simple
// just think of let x = 10;
export interface VarDeclaration extends Expr {
  kind: "VarDeclaration";
  constant: boolean;
  identifier: string;
  value?: Expr;
}

export interface NumberLiteral extends Expr {
  kind: "NumberLiteral";
  value: number;
}

export interface StringLiteral extends Expr {
  kind: "StringLiteral";
  value: string;
}

export interface IdentifierLiteral extends Expr {
  kind: "IdentifierLiteral";
  symbol: string;
}

export interface Property extends Expr {
  kind: "Property";
  key: string;
  value?: Expr; // let x== {};
}
// alright now we can create  parse_object_expr which has high prcedence that parse_assignment_expr
// GOTO: parser.ts -> parse_object_expr
export interface ObjectExpr extends Expr {
  kind: "ObjectExpr";
  properties: Property[];
}

//foo.bar()() -> ()() callExpr bar -> MemberExpr
export interface CallExpr extends Expr {
  kind: "CallExpr";
  args: Expr[];
  caller: Expr;
}

export interface MemberExpr extends Expr {
  kind: "MemberExpr";
  object: Expr;
}

export interface ArrayLiteral extends Expr {
  kind: "ArrayLiteral";
  elements: Expr[];
}

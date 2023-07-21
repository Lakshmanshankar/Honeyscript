import {
  ArrayLiteral,
  AssignmentExpr,
  BinaryExpr,
  CallExpr,
  Expr,
  IdentifierLiteral,
  MemberExpr,
  NumberLiteral,
  ObjectExpr,
  Program,
  Property,
  StringLiteral,
  VarDeclaration,
} from "./ast.ts";
import { Token, tokenize, TokenType } from "./lexer.ts";

export class Parser {
  private tokens: Token[] = [];

  private at() {
    return this.tokens[0] as Token;
  }

  private eat() {
    const prev = this.tokens.shift() as Token;
    return prev;
  }

  private notEnd() {
    return this.at().type != TokenType.EOF;
  }
  // check if the previous Token Match with Given Type if
  // Not exited with the error Msg
  private expect(type: TokenType, errMsg: string) {
    const prev = this.eat();
    if (prev.type != type) {
      throw `🍁 parser error\n: ${JSON.stringify(prev)} ${type}${errMsg}`;
    }
    return prev;
  }

  /**
   * This Method will Create the AST Program Node
   * and ProgramNodes Body Contains all other Statements
   */
  produceAST(sourceCode: string): Program {
    this.tokens = tokenize(sourceCode);
    const program: Program = {
      kind: "Program",
      body: [],
    };

    while (this.notEnd()) {
      program.body.push(this.parse_stmt());
    }
    // console.log(program.body);

    return program;
  }

  private parse_stmt(): Expr {
    switch (this.at().type) {
      case TokenType.Let:
      case TokenType.Const:
        return this.parse_var_declaration();
      default:
        return this.parse_expr();
    }
  }
  private parse_var_declaration(): Expr {
    const isConstant = this.eat().type == TokenType.Const;
    const identfier = this.expect(
      TokenType.Identifier,
      `Expecting Identifier after the keyword let or const`,
    ).value;
    // now we have both keyword and identfier
    if (this.at().type == TokenType.SemiColon) {
      this.eat();
      if (isConstant) {
        this.expect(TokenType.Equals, `constants must be defined`);
      }
      return {
        kind: "VarDeclaration",
        identifier: identfier,
        constant: false,
      } as VarDeclaration;
    }

    this.expect(
      TokenType.Equals,
      `Expecting an Equals sign for variable Declaration`,
    );
    const value = this.parse_expr();

    this.expect(
      TokenType.SemiColon,
      `Expecting semcolon at the end of the declaration ${this.at().value}`,
    );
    return {
      kind: "VarDeclaration",
      identifier: identfier,
      constant: isConstant,
      value: value,
    } as VarDeclaration;
  }

  // Assignment Expr Have less Precedence so we need to parse them First
  private parse_expr(): Expr {
    return this.parse_assignment_expr();
  }

  // No keywords but identfier(May be complex exprs also) = exprs(parse_additive_expr()) because
  // Next less Precedence have access to high Precedence parsers
  private parse_assignment_expr(): Expr {
    const left = this.parse_object_expr();
    if (this.at().type == TokenType.Equals) {
      this.eat();
      const value = this.parse_additive_expr();
      this.expect(
        TokenType.SemiColon,
        `Expecting SemiColon at the End of assignment ${left}`,
      );
      return {
        kind: "AssignmentExpr",
        assignee: left,
        value: value,
      } as AssignmentExpr;
    }

    return left;
  }
  private parse_object_expr(): Expr {
    // we already parsed let x = now starts with "{"
    if (this.at().type !== TokenType.OpenBrace) {
      // now this is not an ObjectExpr we can go further down
      return this.parse_additive_expr();
    }

    this.eat(); // {
    // Now we can create the array of Properties for the Object
    const properties = new Array<Property>();
    // iterate till } or end of Program Body Statements
    while (this.notEnd() && this.at().type !== TokenType.CloseBrace) {
      // cases = { key } || { key, key , } || {key:value, key:value,key}
      const key = this.expect(
        TokenType.Identifier,
        `Expecting Key after Object ${this.at().value}`,
      ).value;
      // now the token can be of , or } incase of { key, } or {key} we dont handle {key:value} in this:
      if (this.at().type == TokenType.Comma) {
        this.eat();
        properties.push({ key, kind: "Property" });
        continue;
      } else if (this.at().type == TokenType.CloseBrace) {
        properties.push({ kind: "Property", key });
        continue;
      }
      // okay now handle { key:value}
      this.expect(TokenType.Colon, `Expecting Colon after Key in Object`);
      const value = this.parse_expr();

      if (this.at().type != TokenType.CloseBrace) {
        this.expect(
          TokenType.Comma,
          `Expecting Comma Incase of Next Proper in Object`,
        );
      }
      properties.push({ kind: "Property", key, value });
    }
    this.expect(
      TokenType.CloseBrace,
      `Expecting Closing } after Object Declaration`,
    );
    return { kind: "ObjectExpr", properties: properties } as ObjectExpr;
  }

  // returns a primaryExpr
  private parse_additive_expr(): Expr {
    let lhs = this.parse_multiplicative_expr();
    while (
      this.at().value == "+" || this.at().value == "-" ||
      this.at().value == ">" || this.at().value == "<"
    ) {
      const operator = this.eat().value; // "/" or "*" or "%";
      //assign the right hand side ops to lhs
      const right = this.parse_multiplicative_expr();
      lhs = {
        kind: "BinaryExpr",
        operator,
        left: lhs,
        right: right,
      } as BinaryExpr;
    }
    return lhs;
  }

  // High Precedence Only Next To PrimaryExpr 💪
  // lhs (Primaryexr) <"/","*","%"> rhs(primary) then assign to lhs
  // returns a primaryExpr
  private parse_multiplicative_expr(): Expr {
    let lhs = this.parse_call_and_memeber_expr();
    while (
      this.at().value == "/" || this.at().value == "*" || this.at().value == "%"
    ) {
      const operator = this.eat().value; // "/" or "*" or "%";
      //assign the right hand side ops to lhs
      const right = this.parse_call_and_memeber_expr();
      lhs = {
        kind: "BinaryExpr",
        operator,
        left: lhs,
        right: right,
      } as BinaryExpr;
    }
    return lhs;
  }
  private parse_call_and_memeber_expr(): Expr {
    // foo.bar.() foo.bar will be parsed at parse_memeber_expr
    const member = this.parse_memeber_expr();
    if (this.at().type == TokenType.OpenParen) {
      return this.parse_call_only_expr(member);
    }
    return member;
  }

  // recursively searches till the last open() and return its callExpr to the
  // parent to the parent ...
  private parse_call_only_expr(member: Expr): Expr {
    let call_expr: Expr = {
      kind: "CallExpr",
      caller: member,
      args: this.parse_call_args(),
    } as CallExpr; // now we parsed atlease one ()
    // this is chained foo.bar()()
    if (this.at().type == TokenType.OpenParen) {
      call_expr = this.parse_call_only_expr(call_expr);
    }
    return call_expr;
  }
  // there are two cases ) Immediate closing then we return empty []
  // else we parse the arguments of that ( args1,2,...)
  private parse_call_args(): Expr[] {
    this.expect(TokenType.OpenParen, `Expecting and OpenParen after Memeber()`);
    const args: Expr[] = this.at().type == TokenType.CloseParen
      ? []
      : this.parse_argument_list();

    this.expect(TokenType.CloseParen, `Expecting Close ) after callExpr`);
    return args;
  }

  // handling ( a+4, n+2 , .....) not this closign parenthis
  private parse_argument_list(): Expr[] {
    const args = [this.parse_assignment_expr()];
    while (this.at().type == TokenType.Comma && this.eat()) {
      args.push(this.parse_assignment_expr());
    }

    return args;
  }

  // foo.bar ->
  private parse_memeber_expr(): Expr {
    let object = this.parse_primary_expr(); // get the first foo
    //now parsing the . or [
    while (
      this.at().type == TokenType.Dot || this.at().type == TokenType.OpenBracket
    ) {
      const operator = this.eat(); // 😋 can be . or [
      let property: Expr;
      let computed: boolean;

      if (operator.type == TokenType.Dot) {
        computed = false; // foo.bar.. not ()
        // Ippothan Identifierke varom yeppa (Now we can parse Identifier)
        // after dot we can only accpt the Indenfier
        property = this.parse_primary_expr();
        if (property.kind != "IdentifierLiteral") {
          throw `Expecting Identifier after dot operator`;
        }
      } else { // this may be [bar[]]
        computed = true;
        property = this.parse_expr(); // it must be a computed value so parseExpr it
        this.expect(
          TokenType.CloseBracket,
          `Expecting Closing ] after MemeberExpr`,
        );
      }

      object = {
        object,
        kind: "MemberExpr",
        computed,
        property,
      } as MemberExpr;
    }

    return object;
  }

  private parse_primary_expr(): Expr {
    const token = this.at().type;

    switch (token) {
      case TokenType.Identifier:
        return {
          kind: "IdentifierLiteral",
          symbol: this.eat().value,
        } as IdentifierLiteral;

      case TokenType.Number:
        return {
          kind: "NumberLiteral",
          value: parseFloat(this.eat().value),
        } as NumberLiteral;

      case TokenType.String:
        return {
          kind: "StringLiteral",
          value: this.eat().value,
        } as StringLiteral;

      case TokenType.OpenParen: {
        this.eat();
        const value = this.parse_expr();
        this.expect(
          TokenType.CloseParen,
          "expecting Closing Parenthis after " + this.at().value,
        );
        return value;
      }
      case TokenType.Array:
        return this.parse_array_expr();
      default:
        console.error(
          `☢️  parser error:\n Unexpected token ${
            JSON.stringify(this.at())
          }  #${this.at().type}`,
        );
        Deno.exit();
    }
  }
  private parse_array_expr(): Expr {
    if (this.at().value === "$") {
      this.eat();
      const elements = this.parse_argument_list();
      this.expect(TokenType.Array, "Expecting Closing $ after array");
      return { kind: "ArrayLiteral", elements } as ArrayLiteral;
    }
    throw "Invalid syntax for object or array expression";
  }
}

// test
// const parser = new Parser();
// console.log(
//   parser.produceAST(`(5 / 1) - 6 * 3`),
// );

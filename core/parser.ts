import {
  AssignmentExpr,
  BinaryExpr,
  Expr,
  IdentifierLiteral,
  NumberLiteral,
  ObjectExpr,
  Program,
  Property,
  VarDeclaration,
} from "./ast.ts";
import { Token, Tokenize, TokenType } from "./lexer.ts";

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
      throw `🍁 parser error\n: ${prev} ${type}${errMsg}`;
    }
    return prev;
  }

  /**
   * This Method will Create the AST Program Node
   * and ProgramNodes Body Contains all other Statements
   */
  produceAST(sourceCode: string): Program {
    this.tokens = Tokenize(sourceCode);
    const program: Program = {
      kind: "Program",
      body: [],
    };

    while (this.notEnd()) {
      program.body.push(this.parse_stmt());
    }

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
      this.at().value == "+" || this.at().value == "-"
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
    let lhs = this.parse_primary_expr();
    while (
      this.at().value == "/" || this.at().value == "*" || this.at().value == "%"
    ) {
      const operator = this.eat().value; // "/" or "*" or "%";
      //assign the right hand side ops to lhs
      const right = this.parse_primary_expr();
      lhs = {
        kind: "BinaryExpr",
        operator,
        left: lhs,
        right: right,
      } as BinaryExpr;
    }
    return lhs;
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
      case TokenType.OpenParen: {
        this.eat();
        const value = this.parse_expr();
        this.expect(
          TokenType.CloseParen,
          "expecting Closing Parenthis after " + this.at().value,
        );
        return value;
      }

      default:
        console.error(
          `☢️  parser error:\n Unexpected token ${
            JSON.stringify(this.at().value)
          }`,
        );
        Deno.exit();
    }
  }
}

// test
// const parser = new Parser();
// console.log(
//   parser.produceAST(`(5 / 1) - 6 * 3`),
// );

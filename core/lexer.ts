/**
 * [                      Tokenize                         ]
 * 1. Tokenize will convert the soure code into an Array of tokens.
 * That's the Entire thing this file can do you can play with this by uncomment the code in the last section
 */

export enum TokenType {
  // Keywords
  Let,
  Const,
  // hopefully add
  // if,else and while 🍒

  // Literals
  // Null,
  Number,
  Identifier,

  //Operator 's
  BinaryOperator,
  Equals,
  Comma,
  Colon,
  SemiColon,
  OpenParen, // (
  CloseParen, // )
  OpenBrace, //  {
  CloseBrace, //  }
  EOF,
}

const KEYWORDS: Record<string, TokenType> = {
  let: TokenType.Let,
  const: TokenType.Const,
};

export interface Token {
  value: string;
  type: TokenType;
}

function token(value = "", type: TokenType): Token {
  return { value, type };
}

// ASCII -> 48 - 57 are Numbers if src is in Range returns True
// https://www.cs.cmu.edu/~pattis/15-1XX/common/handouts/ascii.html
function isNumeric(src: string): boolean {
  return src.charCodeAt(0) >= 48 && src.charCodeAt(0) <= 57;
}

function isAlpha(src: string): boolean {
  return src.toUpperCase() != src.toLowerCase();
}

function isSkippable(src: string): boolean {
  return src == " " || src == "" || src == "\n" || src == "\t" || src == "\r";
}

export function Tokenize(sourceCode: string): Token[] {
  const tokens = new Array<Token>();
  const src = sourceCode.split("");

  while (src.length > 0) {
    if (src[0] == "(") {
      tokens.push(token(src.shift(), TokenType.OpenParen));
    } else if (src[0] == ")") {
      tokens.push(token(src.shift(), TokenType.CloseParen));
    } else if (
      src[0] == "+" || src[0] == "-" || src[0] == "*" || src[0] == "/" ||
      src[0] == "%"
    ) {
      tokens.push(token(src.shift(), TokenType.BinaryOperator));
    } else if (src[0] == "=") {
      tokens.push(token(src.shift(), TokenType.Equals));
    } else if (src[0] == ";") {
      tokens.push(token(src.shift(), TokenType.SemiColon));
    } else if (src[0] == ":") {
      tokens.push(token(src.shift(), TokenType.Colon));
    } else if (src[0] == ",") {
      tokens.push(token(src.shift(), TokenType.Comma));
    } else if (src[0] == "{") {
      tokens.push(token(src.shift(), TokenType.OpenBrace));
    } else if (src[0] == "}") {
      tokens.push(token(src.shift(), TokenType.CloseBrace));
    } else {
      // These tokens may  contains
      if (isNumeric(src[0])) {
        let num = "";
        while (src.length > 0 && isNumeric(src[0])) {
          num += src.shift();
        }
        tokens.push(token(num, TokenType.Number));
      } else if (isAlpha(src[0])) { // This may be Normal Identifier or Some Keywords so ....
        let ident = "";
        while (src.length > 0 && isAlpha(src[0])) {
          ident += src.shift();
        }
        const reswdType = KEYWORDS[ident];
        if (reswdType != undefined) tokens.push(token(ident, reswdType));
        else tokens.push(token(ident, TokenType.Identifier));
      } else if (isSkippable(src[0])) {
        src.shift();
      } else {
        console.error(
          `🏵️ Unexpected Token ${src[0]} Found During Tokenize`,
        );
        Deno.exit(1);
      }
    }
  }

  tokens.push(token("EndOfFile", TokenType.EOF));
  return tokens;
}
// These are some examples of Tokens
// function test() {
//   const tokenstr = `let x = 3`;
//   for (const token of Tokenize(tokenstr)) {
//     console.log(token);
//   }
// }
//
// test();

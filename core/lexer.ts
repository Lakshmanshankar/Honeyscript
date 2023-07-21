/**
 * [                      Tokenize                         ]
 * 1. Tokenize will convert the soure code into an Array of tokens.
 * That's the Entire thing this file can do you can play with this by uncomment the code in the last section
 */

export enum TokenType {
  // Keywords
  Let,
  Const,
  Fn,
  // hopefully add
  // TODO: Implement While Loop
  If,
  Else,

  // Literals
  // Null,
  Number,
  Identifier,
  String,
  Array, // $ 1, 2, 4, 5 $;

  //Operator 's
  BinaryOperator,
  Equals,
  Comma,
  Dot,
  Colon,
  SemiColon,
  OpenParen, // (
  CloseParen, // )
  OpenBrace, //  {
  CloseBrace, //  }
  OpenBracket, // [
  CloseBracket, // ]
  EOF,
}

const KEYWORDS: Record<string, TokenType> = {
  let: TokenType.Let,
  const: TokenType.Const,
  fn: TokenType.Fn,
  if: TokenType.If,
  else: TokenType.Else,
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

function isString(src = ""): boolean {
  return src == "'";
}

function isAlpha(src: string): boolean {
  return src.toUpperCase() != src.toLowerCase();
}

function isSkippable(src: string): boolean {
  return src == " " || src == "" || src == "\n" || src == "\t" || src == "\r";
}

export function tokenize(sourceCode: string): Token[] {
  const tokens = new Array<Token>();
  const src = sourceCode.split("");

  while (src.length > 0) {
    if (src[0] == "(") {
      tokens.push(token(src.shift(), TokenType.OpenParen));
    } else if (src[0] == ")") {
      tokens.push(token(src.shift(), TokenType.CloseParen));
    } else if (
      src[0] == "+" || src[0] == "-" || src[0] == "*" || src[0] == "/" ||
      src[0] == "%" || src[0] == ">" || src[0] == "<"
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
    } // string supprt
    else if (isString(src[0])) {
      src.shift(); // Move past the opening quote
      let str = "";
      while (src.length > 0 && !isString(src[0])) {
        // Handle escaped quote within the string
        if (src[0] === "\\" && src[1] === src[0]) {
          str += src[0] + src[1];
          src.splice(0, 2);
        } else {
          str += src.shift();
        }
      }
      if (src.length === 0) {
        console.error(`Token Error: String Literal Must Be Closed`);
        Deno.exit();
      }
      src.shift(); // Move past the closing quote
      tokens.push(token(str, TokenType.String));
    } // Array
    else if (src[0] == "$") {
      tokens.push(token(src.shift(), TokenType.Array));
    } else if (src[0] == "}") {
      tokens.push(token(src.shift(), TokenType.CloseBrace));
    } else if (src[0] == "[") {
      tokens.push(token(src.shift(), TokenType.OpenBracket));
    } else if (src[0] == "]") {
      tokens.push(token(src.shift(), TokenType.CloseBracket));
    } else if (src[0] == ".") {
      tokens.push(token(src.shift(), TokenType.Dot));
    } // support comments
    else if (src[0] == "@") {
      src.shift();
      while (src[0] != "@") {
        src.shift();
      }
      src.shift();
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
      } // strings
      else if (isSkippable(src[0])) {
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
//   const tokenstr = `let x = @ 1,2,3,4@;`;
//   for (const token of tokenize(tokenstr)) console.log(token);
// }
//
// test();
//
//
// function test1() {
//   const tokenstr = `let x = @ 1,2,3,4@;`;
//   for (const token of Tokenize(tokenstr)) console.log(token);
// }
//
// test();

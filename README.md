# Honeyscript

A Sweet Little Interpreter written in Typescript with Neovim. Honeyscript supports basic interpreter features such as Tokenization, AST Nodes and Support for various runtimeValues.


## Installation

1. Requires deno runtime. Install By (Linux and Mac)
```sh 
curl -fsSL https://deno.land/x/install/install.sh | sh 
 ```
2. Clone the repo
```sh
 git clone https://github.com/Lakshmanshankar/Honeyscript.git
 ```
3. cd and run
```sh 
cd Honeyscript 

deno run -A main.ts
``` 
By default this will run the code in test.txt

you can change to repl by change the repl() on main.ts `line 5` for file and `line 21` for repl


## Things to Learn

1. Tokenization - Which converts the input source code into meaningful array tokens.<br> Each Token have useful information such as the TokenType and the value associated with it
   Example
   `let x = 12 + 12;`
   ```sh
   [
   { value: "let", type: 0 },
   { value: "x", type: 7 },
   { value: "=", type: 11 },
   { value: "12", type: 6 },
   { value: "+", type: 10 },
   { value: "34", type: 6 },
   { value: ";", type: 15 },
   { value: "EndOfFile", type: 22 }
   ]
   ```
 
   Interpreter Evaluate this when a let Tokentype is poped from the Tokens[] -> now we can create the variable Decalration ASTnode and Type will be in `core/ast.ts` 
  
  2. ASTnodes <br>
     AST stands for Abstract Syntax Tree, Which is a hierarchical Data structur that represent the programs syntactic structure.<br>
     AST is created with the help of parser, The Complicated thing In writin an Interpreter. <br>
     Once the parser Creates the AST Now it just the duty of interpreter to evaluate the ASTNode created by the parser <br>

     There are Many Kinds of ASTNodes.
       1. Statements -> full sentences than can change the flow of the program 
         <br> 
         - setting variables 
         - assignments
         - if / else  etc
       2. Expressions -> evaluates the expr and produces a single result.
         <br>
         - BinaryExpr ( takes two operands and a operator) -> sing expr as the result
         - MemberExpr and CallExpr `Math.random() * 21;`
         - they are smaller parts of sentences
  3. Parser
    The Hardest Part in interpreter.
    The parser will evaluate the Tokens[] and creates a Program AstNode which has the Body property where all other tokens are stored. 
    <br>
    Language Grammar and other rules are evaluated in this phase.
    <br>Errors will also be created in this phase 
    <br> Each ASTnode will be parsed and Program Node is now ready for the evaluation by the Interpreter 
  4. Interpreter 
      This phase will evaluate the ASTNodes created in parsing. and Returns a RuntimeVal 
      The environments(scope) for function will be handled in this phase
      <br>

      During program execution, variables are assigned values, expressions are evaluated, and computations take place.

  ## Okay Enough Theory



## Features

1. Variable Declaration
2. NumericLiterals supports Order of Precedence PEMDAS
3. String Literals
4. Arrays [ with no indexing ]

5. If / Else statements
6. While Loop `for loop` is not currently supported
7. Functions and Closures
8. Objects with Member and CallExpr
9. BinaryExpr (+,-,\*,/,%) , < and > operators
10. native functions and BlockStatements

### Examples


### Numberliterals


The `NumberLiteral` represents a numeric value in the language. It supports basic arithmetic operations such as addition, subtraction, multiplication, and division.

```javascript
let x = 42;
let y = 10;
let result = x + y; // result is 52
```

### StringLiteral

The `StringLiteral` represents a sequence of characters enclosed in single quotes. It supports concatenation with the + operator.


```javascript 
let message = 'Hello, ';
let name = 'John';
let greeting = message + name; // greeting is 'Hello, John'
```

### ArrayLiterals

The `ArrayLiteral` represents an ordered collection of elements. Elements can be of any type, including other arrays.

```typescript

let numbers = $ 1, 2, 3, 4$;
let fruits = $ 'apple', 'banana', 'orange' $;

```

### ObjectLiteral

The `ObjectLiteral` represents a collection of key-value pairs, where the keys are strings and the values can be of any type.


```javascript
let person = {
  name: 'John',
  age: 30,
  city: 'New York'
};
```

### Comments

The Comments are ignored by the tokenizer.

```sh

@ I am a Comment
and I can spread to 
Multiple Lines @

```


## Control Flow

### If-Else Statement

The `if-else` statement allows conditional execution of code blocks based on a given condition.

```javascript

  if (12 > 12) {
    print(12)
  } else {
    print(23)
  }
}
```
### While Loop

The `while` loop repeatedly executes a code block as long as a specified condition is true.

```js
let x = 10;

while ( x > 0){
  print(x)
  x = x - 1;
}
```

## Functions

### Function Declaration

Functions can be declared and called in the language. They can take parameters and return values.


```js

fn isOddOrEven(x){
  let rem = x % 2;
  if (rem < 1){
    print('Even Number')
  }else {
    print('Odd Number')
  }
}

let x = 123;
isOddOrEven(x)
```

## Other Features

### Let and Const

The `let` and `const` keywords are used for variable declarations. Variables declared with `let` can be reassigned, while variables declared with `const` are read-only.

```js
 let rem = 120+23;
 const another = rem + 23 *(4-2);
 rem = another +23;
 ```

### Print Statement

The `print` statement is used to output a value to the console.
```py
print(`Runtimevalue`)
```

### Version 

Return `version` of the Honescript Interpreter
```js
version()
```

### License 
```js
license 
```

### Contribution

All are welcome 🌱
Thanks

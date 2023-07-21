import { Parser } from "./core/parser.ts";
import { createGlobalEnv } from "./runtimes/environment.ts";
import { evaluate } from "./runtimes/interpreter.ts";

run("./test.txt");

// if u notice any typos please ignore them as i make a few typos here and there 🏵️
async function run(sourceFile: string) {
  const parser = new Parser();
  const env = createGlobalEnv();

  const input = await Deno.readTextFile(sourceFile);
  // console.log(input);

  const program = parser.produceAST(input);
  console.log(program); // if u want to see the ASTnodes
  //
  const result = evaluate(program, env); // { kind:"Program", body:[stmts]}
  console.log(result);
}
// repl();
function repl() {
  const parser = new Parser();
  const env = createGlobalEnv();
  console.log("🍯 Repl v0.1 🐬");
  while (true) {
    const input = prompt(`${"\x1b[32m"}❯ \x1b[0m`);
    if (!input || input.includes("exit")) Deno.exit(1);
    else {
      const Program = parser.produceAST(input);
      console.log(Program);

      const result = evaluate(Program, env);
      console.log(result);
    }
  }
}

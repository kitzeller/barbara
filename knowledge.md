# graphics-virtual-machine knowledge base

Just some good things to know and clarify.



## SVG

- SVG stands for Scalable Vector Graphics
- SVG is used to define vector-based graphics for the Web
- SVG defines the graphics in XML format
- Every element and every attribute in SVG files can be animated
- SVG is a W3C recommendation
- SVG integrates with other W3C standards such as the DOM and XSL
- Resolution independent
- Support for event handlers
- Best suited for applications with large rendering areas (Google Maps)
- Slow rendering if complex (anything that uses the DOM a lot will be slow)
- Not suited for game applications
- Each drawn shape is remembered as an object. If attributes of an SVG object are changed, the browser can automatically re-render the shape.
- SVG images can be created and edited with any text editor
- SVG images can be searched, indexed, scripted, and compressed
- SVG images are scalable
- SVG images can be printed with high quality at any resolution
- SVG images are zoomable
- SVG graphics do NOT lose any quality if they are zoomed or resized
- SVG is an open standard
- SVG files are pure XML

    
```
<svg width="100" height="100">
  <circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow" />
</svg>
```

```
<svg width="300" height="200">
  <polygon points="100,10 40,198 190,78 10,78 160,198"
  style="fill:lime;stroke:purple;stroke-width:5;fill-rule:evenodd;" />
</svg>
```

[w3schools](https://www.w3schools.com/graphics/svg_intro.asp)

## Virtual Machines
"A virtual machine (VM) is a software program or operating system that not only exhibits the behavior of a separate computer, but is also capable of performing tasks such as running applications and programs like a separate computer." - [techopedia](https://www.techopedia.com/definition/4805/virtual-machine-vm)


## Languages

### Interpreter
In computer science, an interpreter is a computer program that directly executes instructions written in a programming or scripting language, without requiring them previously to have been compiled into a machine language program. 
An interpreter generally uses one of the following strategies for program execution: 
1. Parse the source code and perform its behavior directly; 
2. Translate source code into some efficient intermediate representation and immediately execute this; 
3. Explicitly execute stored precompiled code made by a compiler which is part of the interpreter system.

[wikipedia](ttps://en.wikipedia.org/wiki/Interpreter_(computing))

E.g. (from live code paper) The playback engine implements an interpreter of the target language with flexible and sample accurate scheduling.

### Compiler
"The simplest definition of a compiler is a program that translates code written in a high-level programming language (like JavaScript or Java) into low-level code (like Assembly) directly executable by the computer or another program such as a virtual machine." - https://medium.com/hackernoon/compilers-and-interpreters-3e354a2e41cf

- Interpreters and compilers are very similar in structure. 
- The main difference is that an interpreter directly executes the instructions in the source programming language while a compiler translates those instructions into efficient machine code.
- An interpreter will typically generate an efficient intermediate representation and immediately evaluate it. 
- Depending on the interpreter, the intermediate representation can be an AST, an annotated AST or a machine-independent low-level representation such as the three-address code.

### Parsing

"The most immediately visible part of a programming language is its syntax, or notation. A parser is a program that reads a piece of text and produces a data structure that reflects the structure of the program contained in that text. If the text does not form a valid program, the parser should point out the error." - https://eloquentjavascript.net/12_language.html

Regular Expressions
- A grammar consists of a set of rules, the first of which
is the start rule. 
- Each rule has a name, a syntactic pattern
of strings, rule names, and operators that define the kinds
of input the rule can recognize and return, plus an optional
semantic action which can transform what is returned
- Parsing is akin to
translation of the syntax of a source language into the semantics of a target language.

### Target Language

The target language is a bit like the instruction sequences real compilers use, in that it is a list of commands.

E.g. (from live code paper) The grammar editor allows a very wide range of idiosyncratic languages to be designed, which through translation
     to the target language must create sonic structure through
     the set of features available in the playback engine.

### Stack-based languages
Stack-oriented languages operate on one or more stacks, each of which may serve a different purpose. 
Thus, programming constructs in other programming languages may need to be modified for use in a stack-oriented system. 
Further, some stack-oriented languages operate in postfix or Reverse Polish notation, that is, any arguments or parameters for a command are stated before that command. 
For example, postfix notation would be written 2, 3, multiply instead of multiply, 2, 3 (prefix or Polish notation), or 2 multiply 3 (infix notation).

https://en.wikipedia.org/wiki/Stack-oriented_programming


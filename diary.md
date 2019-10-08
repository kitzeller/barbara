# graphics-virtual-machine
WPI ISP creating a virtual machine for live coding visuals (B-term 2019)



## 10/8/19

- Looked through NIME workshop source code
- Looked through Peg.js documentation
- Current understanding:
    - I need to create a Target language/instruction set that essentially abstracts Canvas2D functions
    - I need to create a VM that can run this language
    - I need to create an example pegjs grammar of this language
        - the output of the peg.js parse should be in the target language and then run by my vm



"A virtual machine (VM) is a software program or operating system that not only exhibits the behavior of a separate computer, but is also capable of performing tasks such as running applications and programs like a separate computer." - [techopedia](https://www.techopedia.com/definition/4805/virtual-machine-vm)

### Questions

1. In lect.js, the "VM" is really the Pattern Sequencer, comprised of the cq, PQ, and Q objects/functions? And the instruction set (synonymous to Target language?) is defined in the cases/conditions of the if statements/big switch statement in Q.prototype.step?  (snippet of Q.prototype.step referenced below)

2. What is Gibberish's official role in the system's architecture? A helper library for audio output?


```
case "@dup":
    // duplicate whatever is on the stack
    this.stack.push(
        this.stack[this.stack.length-1]
    );
    break;
    
case "@bpm":
    // set bpm:
    var t1 = this.stack.pop();
    t1 = (t1 == undefined) ? 100 : Math.abs(+t1);
    t1 = (t1 == t1) ? t1 : 100;
    bpm = t1;
    break;
    
case "@wait": 
    // TODO: verify stack top is a valid number...
    // pop wait time off the stack:
    var t1 = this.stack.pop();
    t1 = (t1 == undefined) ? 1 : Math.abs(+t1);
    t1 = (t1 == t1) ? t1 : 0;
    this.t += t1 * this.rate;
    // push back to pq:
    //if (this.pq) this.pq.push(this);
    //console.log("\tq.t =", this.t);
    break;
```

## 10/3/19

- Signed ISP form
- Discussed the livecoding language workshop
- Looking at potentially starting with 2D canvas/SVG virtual machine

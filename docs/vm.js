//////////////////////////////////////////////////////////////////////////////////////////
// VM: Barbara?
//////////////////////////////////////////////////////////////////////////////////////////

// Exported
window.seq = {
    commands: {},
};

// SVG Drawing
var draw = SVG().addTo('#drawing').size(800, 800);

// this is where the externally triggered events are buffered to synchronize them to beats
var cq = {
    cmds: []
};


cq.tick = function (t) {
    this.resume();
};

cq.resume = function () {
    while (this.cmds.length) {
        var cmd = this.cmds.shift();
        cmd();
    }
    return this;
};

window.seq.addCommand = function (name, impl) {
    this.commands[name] = impl;
};

// define a svg instance.
// if name didn't exist, create a new one.
window.seq.define = function (name, score) {
    console.log("Creating " + typeof name + " " + Array.isArray(score));

    // Clear the SVG
    draw.clear();

    // sync this:
    cq.cmds.push(function () {
        // create it:
        return new PQ(score, name).connect();
    });

    return new PQ(score, name).connect();
};

// we could also call this an agent, or player, or scheduler, etc.
// it can contain multiple command queues (type Q), and executes them in an interleaved way
// to ensure proper timing -- a bit like coroutines.
function PQ(score, name) {
    this.heap = []; // the list of active command queues (next to resume is at the top)
    this.name = name || "default";

    if (score) {
        this.fork(score, this);
    }
};

var svgInstances = [];


PQ.prototype.connect = function () {
    console.log("connecting...");
    svgInstances.push(this);
    return this;
};

PQ.prototype.disconnect = function () {
    return this;
};

// how to play the pq in a sample callback:
PQ.prototype.tick = function () {
    this.resume();
};

PQ.prototype.fork = function (score, parentQ) {
    var q = new Q(score, this.name, parentQ);
    this.push(q);
};

// PQ is always sorted on insertion
PQ.prototype.push = function (q) {
    this.heap.push(q);
    return this;
};

// true if no Q's scheduled
PQ.prototype.empty = function () {
    return (this.heap.length == 0);
};

// get the time of the next item:
PQ.prototype.at = function () {
    if (!this.empty()) {
        return this.heap[this.heap.length - 1].t;
    }
};

// how to play the pq in a sample callback:
PQ.prototype.resume = function (t) {
    console.log("RESUME!");

    var q = this.heap.pop();
    console.log(q);
    //console.log("PQ.tick", q, this.t, q.at);
    if (q.resume(t)) {
        this.push(q);	// re-schedule it
    }

    return this;
};

function Q(score, pq, parentQ) {
    this.pq = pq;
    this.todo = [];
    this.stack = [];
    this.vars = [];
    this.parentQ = parentQ;
    this.context = {};

    this.debug = true;
    if (score) this.push(score);
};

Q.prototype.get = function (name) {
    var q = this;
    var val = q.context[name];
    while (val == undefined && q.parentQ) {
        q = q.parentQ;
        val = q.context[name];
    }
    return val;
};

Q.prototype.push = function (v) {
    this.todo.push(v);
};

// in each instruction handler,
// we can push to the todo queue
// and push to and pop from the stack
Q.prototype.step = function () {
    if (this.debug) {
        //console.log("\tstack:", JSON.stringify(this.stack));
        //console.log("\tqueue:", JSON.stringify(this.todo));
    }
    if (this.todo.length) {
        var item = this.todo.pop();
        if (item == null || item == undefined) {
            // ignore
        } else if (Array.isArray(item)) {
            for (i = item.length - 1; i >= 0; i--) {
                this.todo.push(item[i]);
            }

        } else if (typeof item == "string" && item.charAt(0) === "@") {
            var op = item;

            // Target language
            switch (op) {

                case "@circle":  // [x, y, r, @circle]
                    //let cc = this.stack.pop();
                    let rc = this.stack.pop();
                    let yc = this.stack.pop();
                    let xc = this.stack.pop();

                    var circle = draw.circle(rc).move(xc, yc);

                    this.vars.push(c);

                    break;
                case "@rect":  // [x, y, width, height, @rect]
                    let hr = this.stack.pop();
                    let wr = this.stack.pop();
                    let yr = this.stack.pop();
                    let xr = this.stack.pop();

                    var r = draw.rect(wr, hr).move(xr, yr);
                    this.vars.push(r);

                    break;
                case "@path":
                    let path = this.stack.pop();

                    break;
                case "@color":
                    let color = this.stack.pop();
                    let elem = this.vars.pop();
                    elem.fill(color);
                    this.vars.push(elem);

                    break;

                case "@outline":
                    let out_width = this.stack.pop();
                    let out_color = this.stack.pop();
                    let out_elem = this.vars.pop();
                    out_elem.stroke({ width: out_width, color: out_color });
                    this.vars.push(out_elem);

                    break;
                case "@rotate":
                    let degree = this.stack.pop();
                    let elem_rotate = this.vars.pop();

                    elem_rotate.rotate(degree);

                    this.vars.push(elem_rotate);
                    break;

                case "@repeat":
                    //...

                    break;

                case "@move":
                    //...
                    let vt = this.vars.pop();
                    let my = this.stack.pop();
                    let mx = this.stack.pop();

                    vt.move(mx, my);
                    this.vars.push(vt);

                    break;

                case "@copy":
                    let sc = this.stack.pop();
                    // console.log("Woooo ", sc)
                    let clone = this.context[sc].clone();
                    draw.add(clone);
                    this.vars.push(clone);
                    break;

                case "@define":
                    let ds = this.stack.pop();
                    let vs = this.vars.pop();
                    // console.log("Define ", ds, vs);
                    this.context[ds] = vs;
                    break;

                case "@get":
                    let cn = this.stack.pop();
                    // console.log(cn);
                    let tp = this.context[cn];
                    // console.log(tp);
                    this.vars.push(tp);
                    break;

                case "@group":
                    var st = draw.group();
                    let s = this.stack.pop();
                    while (s) {
                        st.add(this.context[s]);
                        s = this.stack.pop();
                    }
                    this.vars.push(st);
                    break;

                default:
                    // look up a dynamic rule?
                    var cmd = window.seq.commands[op];
                    //console.log("cmd", op, cmd);
                    if (cmd && typeof (cmd) == "function") {
                        try {
                            cmd(this);
                        } catch (ex) {
                            console.error(ex.message);
                        }
                    } else {
                        console.error("unknown instruction operator:", op);
                    }
                    break;
            }
        } else {
            this.stack.push(item);
        }
    } else {
        console.log("done");
        return true;
    }
};

Q.prototype.resume = function (t) {
    while (this.todo.length) {
        this.step();
    }
    return this.todo.length > 0; // returns false if Q has no more events
};


// Basic Scheduler!!!!
function step(timestamp) {
    let nextEvent = svgInstances.pop();
    if (nextEvent !== undefined) {
        console.log("Stepping!");
        console.log(nextEvent);
        nextEvent.tick()
    }
    window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);

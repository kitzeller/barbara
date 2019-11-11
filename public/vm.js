//////////////////////////////////////////////////////////////////////////////////////////
// VM: Barbara?
//////////////////////////////////////////////////////////////////////////////////////////
// Exported
window.seq = {
    commands: {},
};

// SVG Drawing
var WIDTH = 800;
var HEIGHT = 800;
var draw;

// this is where the externally triggered events are buffered to synchronize them to beats
var cq = {
    cmds: []
};

uid = (function () {
    var id = 0;
    return function () {
        id++;
        return "uid" + id;
    }
})();


window.seq.play_element_text = function (element) {
    let id = "#" + $(element).parent().next(".res")[0].id;
    window.seq.define(uid(), JSON.parse(element.innerText), id);
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
window.seq.define = function (name, score, dom_id) {
    $(dom_id).empty();
    draw = SVG().addTo(dom_id).size(WIDTH, HEIGHT);
    draw.viewbox(0, 0, 800, 800);
    $("#sliders").empty();

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
    this.score = score;

    this.debug = false;
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
    try {
        if (this.debug) {
            console.log("\tstack:", JSON.stringify(this.stack));
            console.log("\tqueue:", JSON.stringify(this.todo));
            console.log("\tvars:", this.vars);
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

                    case "@svg":
                        // creates svg as group
                        let svg_string = this.stack.pop();

                        if (svg_string.includes('$')) {
                            let result = svg_string.split('$')[1];
                            svg_string = window.savedSessions[result].svg;
                            // console.log(result)
                            // console.log(svg_string);
                        }

                        let svg_group = draw.group();
                        svg_group.svg(svg_string);
                        console.log(draw.svg(false));
                        this.vars.push(svg_group);
                        break;

                    case "@export":
                        // Not sure if we want it in the lang
                        let response = prompt("What do you want to call this?.");

                        if (response == "" || response == null) {
                            console.log("Not saving");
                            return;
                        }

                        // Added false?
                        let svgText = draw.svg(false);
                        $.post("savesession", {
                            grammar: grammar_cm.getValue(),
                            input: input_cm.getValue(),
                            output: JSON.stringify(this.score),
                            svg: svgText,
                            name: response
                        });
                        break;

                    case "@random-number":
                        let min, max;

                        min = 0;
                        max = 100;

                        // if (this.stack.length < 1){
                        //     min = 0;
                        //     max = 100;
                        // } else {
                        //     max = parseFloat(this.stack.pop());
                        //     min = parseFloat(this.stack.pop());
                        // }
                        let rn = Math.floor(Math.random() * (max - min)) + min;
                        this.stack.push(rn);
                        break;

                    case "@random-color":
                        // TODO: Update
                        this.stack.push('#' + Math.floor(Math.random() * 16777215).toString(16));
                        break;

                    case "@random-theme":
                        let c_mode = this.stack.pop();
                        // vibrant, sine, pastel, dark, rgb, lab, grey

                        let r_color = SVG.Color.random(c_mode).toHex();
                        this.stack.push(r_color);
                        break;

                    case "@circle":  // [x, y, r, @circle]
                        //let cc = this.stack.pop();

                        // TODO: Abstract "default" values
                        if (this.stack.length < 1) {
                            // default
                            let circ = draw.circle(400);
                            this.vars.push(circ);
                        } else {
                            let rc = this.stack.pop() / 100 * WIDTH;
                            let yc = this.stack.pop() / 100 * HEIGHT;
                            let xc = this.stack.pop() / 100 * WIDTH;
                            let circ = draw.circle(rc).move(xc, yc);
                            this.vars.push(circ);
                        }

                        break;
                    case "@rect":  // [x, y, width, height, @rect]
                        if (this.stack.length < 1) {
                            let r = draw.rect(400, 400);
                            this.vars.push(r);
                        } else {
                            let hr = this.stack.pop() / 100 * HEIGHT;
                            let wr = this.stack.pop() / 100 * WIDTH;
                            let yr = this.stack.pop() / 100 * HEIGHT;
                            let xr = this.stack.pop() / 100 * WIDTH;

                            let r = draw.rect(wr, hr).move(xr, yr);
                            this.vars.push(r);
                        }

                        break;

                    case "@polygon":
                        let polygon = this.stack.pop();
                        var p = draw.polygon(polygon);
                        this.vars.push(p);

                        break;

                    case "@path":
                        let path = this.stack.pop();
                        let pa = draw.path(path);
                        this.vars.push(pa);

                        break;

                    case "@triangle":
                        if (this.stack.length < 1) {
                            let triangle = draw.path("M 0,200 L 200,0 L 200,200 z");
                            this.vars.push(triangle);
                        } else {
                            let side_size = parseInt(this.stack.pop()) / 100 * WIDTH;
                            let triangle = draw.path("M 0," + side_size + " L " + side_size + ",0 L " + side_size + "," + side_size + " z");
                            this.vars.push(triangle);
                        }

                        break;

                    case "@ellipse":
                        let eh = this.stack.pop() / 100 * HEIGHT;
                        let ew = this.stack.pop() / 100 * WIDTH;
                        let ellip = draw.ellipse(ew, eh);
                        this.vars.push(ellip);

                        break;

                    case "@line":
                        let l1 = this.stack.pop() / 100 * HEIGHT;
                        let l2 = this.stack.pop() / 100 * HEIGHT;
                        let l3 = this.stack.pop() / 100 * HEIGHT;
                        let l4 = this.stack.pop() / 100 * HEIGHT;

                        let li = draw.line(l4, l3, l2, l1).stroke({width: 1, color: "#fff"});

                        this.vars.push(li);
                        break;

                    case "@text":
                        if (this.stack.length > 2) {
                            let font_size = parseInt(this.stack.pop());
                            let font = this.stack.pop();
                            let text = this.stack.pop();
                            let text_elem = draw.text(text).font({size: font_size, family: font});
                            this.vars.push(text_elem);
                        } else {
                            let text = this.stack.pop();
                            let text_elem = draw.text(text);
                            this.vars.push(text_elem);
                        }

                        break;

                    case "@pattern":
                        // var pattern = draw.pattern(20, 20, function (add) {
                        //     add.rect(20, 20).fill('#f06');
                        //     add.rect(10, 10);
                        //     add.rect(10, 10).move(10, 10);
                        // });

                        // let svg_pattern_string = this.stack.pop();
                        //
                        // if (svg_pattern_string.includes('$')) {
                        //     let result = svg_pattern_string.split('$')[1];
                        //     svg_pattern_string = window.savedSessions[result].svg;
                        // }

                        //let svg_pattern_group = draw.group();
                        //svg_pattern_group.svg(svg_string);

                        let pattern_h = this.stack.pop();
                        let pattern_w = this.stack.pop();

                        let next_item = this.vars.pop();

                        var pattern = draw.pattern(pattern_w, pattern_h, function (add) {
                            add.add(next_item)
                        });

                        this.vars.push(pattern);
                        break;

                    case "@gradient":
                        let gradient = this.stack.pop();
                        let grad_type = this.stack.pop();

                        gradient = gradient.split(",");

                        var grad = draw.gradient(grad_type, function (add) {
                            for (let g of gradient) {
                                g = g.trim();
                                g = g.split(" ");
                                add.stop(parseInt(g[0]), g[1], parseInt(g[2]));
                            }
                        });

                        this.vars.push(grad);
                        break;

                    case "@image":
                        let url = this.stack.pop();
                        var img = draw.image(url);
                        this.vars.push(img);
                        break;

                    case "@color":
                        let elem = this.vars.pop();
                        let color = this.stack.pop();

                        if (elem.type === "g") {
                            // group
                            elem.each(function (i, children) {
                                this.fill({color: '#f06'})
                            }, true)
                        }

                        if (color.includes('$')) {
                            let result = color.split('$')[1];
                            color = this.context[result]
                        }

                        try {
                            if (elem.type === "g") {
                                elem.each(function (i, children) {
                                    this.fill({color: color})
                                }, true)
                            } else {
                                elem.fill(color);
                            }
                        } catch {
                            elem.fill("#000000");
                        }

                        this.vars.push(elem);

                        break;

                    case "@outline":
                        let out_width = this.stack.pop();
                        let out_color = this.stack.pop();
                        let out_elem = this.vars.pop();
                        try {
                            out_elem.stroke({width: out_width, color: out_color});
                        } catch {
                            out_elem.stroke({width: out_width, color: "#000000"});
                        }
                        this.vars.push(out_elem);

                        break;

                    case "@opacity":
                        let o_val = parseFloat(this.stack.pop());
                        let o_elem = this.vars.pop();
                        o_elem.opacity(o_val);
                        this.vars.push(o_elem);

                        break;

                    case "@radius":
                        let r_val = parseFloat(this.stack.pop());
                        let rad_elem = this.vars.pop();
                        rad_elem.radius(r_val);
                        this.vars.push(rad_elem);

                        break;

                    case "@rotate":
                        let degree = this.stack.pop();
                        let elem_rotate = this.vars.pop();

                        elem_rotate.rotate(degree);

                        this.vars.push(elem_rotate);
                        break;

                    case "@polar":
                        let theta = parseInt(this.stack.pop());
                        let r = parseInt(this.stack.pop()) / 100 * WIDTH / 2;

                        const x = r * Math.cos(theta);
                        const y = r * Math.sin(theta);

                        console.log(x, y);

                        this.stack.push(x);
                        this.stack.push(y);

                        break;

                    case "@end-loop":
                        // Do nothing?
                        break;
                    case "@index":
                        // Do nothing?
                        break;

                    case "@loop":
                        let loop_num = parseInt(this.stack.pop());
                        let original_todo = this.todo;

                        let end_loop_ind = original_todo.lastIndexOf("@end-loop");
                        original_todo = original_todo.slice(end_loop_ind);

                        // Get index
                        let while_ind = this.todo.lastIndexOf("@index");
                        while (this.todo.includes("@index") && while_ind > end_loop_ind) {
                            while_ind = this.todo.lastIndexOf("@index");
                            if (while_ind < end_loop_ind) {
                                break;
                            }
                            this.todo[while_ind] = 0;
                        }

                        for (let i = 1; i < loop_num; i++) {
                            this.todo.splice(end_loop_ind, 0, ...original_todo);
                            console.log("todo ", this.todo);

                            let ind = this.todo.lastIndexOf("@index")
                            while (this.todo.includes("@index") && ind > end_loop_ind) {
                                ind = this.todo.lastIndexOf("@index")
                                if (ind < end_loop_ind) {
                                    break;
                                }
                                this.todo[ind] = i;
                            }
                        }
                        break;

                    case "@repeat":
                        let elem_repeat = this.vars.pop();
                        let group = draw.group();
                        group.add(elem_repeat)
                        group.add(elem_repeat.clone().flip('x', 0.5 * HEIGHT));
                        group.add(elem_repeat.clone().flip('y', 0.5 * WIDTH));
                        group.add(elem_repeat.clone().flip(0.5 * HEIGHT));

                        // TODO: Add number of repeats
                        // let times = this.stack.pop();
                        // let count  = 0;
                        // while (count < times){
                        //
                        //     count++;
                        // }

                        this.vars.push(group);

                        break;

                    case "@order":
                        let elem_order = this.vars.pop();
                        let order = this.stack.pop();

                        if (order === 'forward') {
                            elem_order.forward();
                        } else if (order === 'backward') {
                            elem_order.backward();
                        } else if (order === 'back') {
                            elem_order.back();
                        } else if (order === 'front') {
                            elem_order.front();
                        }

                        this.vars.push(elem_order);
                        break;

                    case "@animate-rotate":
                        let elem_ani = this.vars.pop(); // element

                        let ani_loop_r = this.stack.pop(); // loop boolean
                        let ani_time_r = this.stack.pop(); // animation time
                        ani_time_r = parseInt(ani_time_r);
                        //console.log(parseInt((ani_time_r)))

                        let ani_degree = this.stack.pop(); // rotation degree

                        if (ani_loop_r === "true") {
                            elem_ani.animate(ani_time_r).rotate(ani_degree).loop()
                        } else {
                            elem_ani.animate(ani_time_r).rotate(ani_degree);
                        }

                        this.vars.push(elem_ani);
                        break;

                    case "@animate-move":
                        let elem_ani_move = this.vars.pop(); // element

                        let ani_loop_m = this.stack.pop(); // loop boolean
                        let ani_time_m = this.stack.pop(); // animation time

                        let ani_y = this.stack.pop() / 100 * HEIGHT;
                        let ani_x = this.stack.pop() / 100 * WIDTH;

                        if (ani_loop_m === "true") {
                            elem_ani_move.animate(ani_time_m).move(ani_x, ani_y).loop();
                        } else {
                            elem_ani_move.animate(ani_time_m).move(ani_x, ani_y);
                        }

                        this.vars.push(elem_ani_move);
                        break;

                    case "@animate-color":
                        // Input must be hex values
                        let elem_ani_color = this.vars.pop(); // element

                        let ani_loop_c = this.stack.pop(); // loop boolean
                        let ani_time_c = parseInt(this.stack.pop()); // animation time

                        let ani_color = this.stack.pop(); // color

                        if (ani_loop_c === "true") {
                            elem_ani_color.animate(ani_time_c).fill(ani_color).loop()
                        } else {
                            elem_ani_color.animate(ani_time_c).fill(ani_color);
                        }

                        this.vars.push(elem_ani_color);
                        break;

                    case "@move":
                        let vt = this.vars.pop();
                        let my = this.stack.pop() / 100 * HEIGHT;
                        let mx = this.stack.pop() / 100 * WIDTH;

                        vt.move(mx, my);
                        this.vars.push(vt);

                        break;

                    case "@translate":
                        let vtt = this.vars.pop();
                        let myt = this.stack.pop() / 100 * HEIGHT;
                        let mxt = this.stack.pop() / 100 * WIDTH;

                        vtt.translate(mxt, myt);
                        this.vars.push(vtt);

                        break;

                    case "@center":
                        let elem_center = this.vars.pop();
                        let c_x = this.stack.pop() / 100 * HEIGHT;
                        let c_y = this.stack.pop() / 100 * WIDTH;

                        elem_center.center(c_x, c_y);
                        this.vars.push(elem_center);

                        break;

                    case "@size":
                        let elem_size = this.vars.pop();
                        let sh = this.stack.pop() / 100 * HEIGHT;
                        let sw = this.stack.pop() / 100 * WIDTH;

                        elem_size.size(sw, sh);
                        this.vars.push(elem_size);

                        break;

                    case "@scale":
                        let elem_scale = this.vars.pop();
                        let sch = this.stack.pop() / 100;
                        let scw = this.stack.pop() / 100;

                        elem_scale.scale(sch, scw);
                        this.vars.push(elem_scale);

                        break;

                    case "@flip":
                        let elem_flip = this.vars.pop();
                        let axis = this.stack.pop();
                        let offset;
                        if (axis === 'x') {
                            offset = this.stack.pop() / 100 * HEIGHT;
                        } else {
                            offset = this.stack.pop() / 100 * WIDTH;
                        }
                        elem_flip.flip(axis, offset);
                        this.vars.push(elem_flip);
                        break;

                    case "@diag":
                        let elem_flip_diag = this.vars.pop();
                        let diag_offset = this.stack.pop();
                        elem_flip_diag.flip(diag_offset);
                        break;

                    case "@copy":
                        let sc = this.stack.pop();
                        let clone = this.context[sc].clone();
                        draw.add(clone);
                        this.vars.push(clone);
                        break;

                    case "@all":
                        let new_draw = draw.group();
                        draw.each(function (i, children) {
                            if (this !== new_draw) {
                                this.putIn(new_draw)
                            }
                        });

                        this.vars.push(new_draw);
                        break;

                    case "@duplicate":
                        let to_clone = this.vars.pop();
                        console.log(to_clone);
                        let clone_v = to_clone.clone();
                        draw.add(clone_v);
                        this.vars.push(clone_v);
                        break;

                    case "@link":
                        let to_link = this.vars.pop();
                        let linked_v = draw.use(to_link);
                        this.vars.push(linked_v);
                        break;

                    case "@merge":
                        // TODO
                        var box1 = draw.rect(100, 100).move(50, 50).bbox();
                        var box2 = draw.rect(100, 100).move(200, 200).bbox();
                        var box3 = box1.merge(box2);

                        break;

                    case "@define":
                        let ds = this.stack.pop();
                        let vs = this.vars.pop();
                        this.context[ds] = vs;
                        break;

                    case "@get":
                        let cn = this.stack.pop();
                        let tp = this.context[cn];
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

                    case "@slider":
                        let max_val = this.stack.pop();
                        let min_val = this.stack.pop();
                        let slider_type = this.stack.pop();
                        let var_name = this.stack.pop();

                        let the_uid = uid();
                        console.log(the_uid);
                        $("#sliders").append("<h3>" + var_name + " - " + slider_type + "</h3>")
                        $("#sliders").append("<input type = \"range\" min=\""+min_val+"\" max=\""+ max_val+"\" value=\"0\" step=\"1\" id=\""+the_uid+"\"/>")
                        const that = this;
                        $("#" + the_uid).on("input",function(){
                            switch (slider_type) {
                                case "rotation":
                                    that.context[var_name].rotate($(this).val());
                                    break;
                                case "sizingxy":
                                    console.log($(this).val());
                                    that.context[var_name].size($(this).val()/100 * WIDTH, $(this).val()/100 * HEIGHT);
                                    break;
                            }
                        });
                        break;

                    // Arithmetic Operators
                    case "@*":
                    case "@mul":
                        let v2_mult = this.stack.pop();
                        let v1_mult = this.stack.pop();

                        this.stack.push(v1_mult * v2_mult);
                        break;

                    case "@/":
                    case "@div":
                        let v2_div = this.stack.pop();
                        let v1_div = this.stack.pop();

                        this.stack.push(v1_div / v2_div);
                        break;

                    case "@+":
                    case "@add":
                        let v2_plus = this.stack.pop();
                        let v1_plus = this.stack.pop();

                        this.stack.push(v1_plus + v2_plus);
                        break;

                    case "@-":
                    case "@sub":
                        let v2_minus = this.stack.pop();
                        let v1_minus = this.stack.pop();

                        this.stack.push(v1_minus - v2_minus);
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
    } catch (error) {
        console.log("ERROR: ", error);
        return true;
    }
};

Q.prototype.resume = function (t) {
    while (this.todo.length) {
        this.step();
    }
    window.svg = draw.svg(false);
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

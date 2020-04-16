/**
 * Code for Barbara VM Editor
 * @author Kit Zellerbach
 */

var exportID;
var originalData;
var currentView = 'grammar';

/**
 * Modal Events
 */
var modal = document.getElementById("myModal");

var converter = document.getElementById("converter");
converter.style.display = "none";
converter.height = 800;
converter.width = 800;

var btn = document.getElementById("helpButton");
var span = document.getElementsByClassName("close")[0];
btn.onclick = function () {
    modal.style.display = "block";
};
span.onclick = function () {
    modal.style.display = "none";
};
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
};


var tweet_modal = document.getElementById("tweet_modal");
var tweet_close = document.getElementsByClassName("close")[1];
tweet_close.onclick = function () {
    tweet_modal.style.display = "none";
};

/**
 * Get saved SVGS
 */
var looping = false;
var interval;
var savedSVGs = window.localStorage.getItem('barbara-vm-svgs');
window.savedSessions = {};
if (savedSVGs) {
    let obj = JSON.parse(savedSVGs);
    for (let o of obj.ids) {
        $.getJSON("sessions/" + o, function (data) {
            window.savedSessions[data._id] = data;
            $('#side-content').append("<h3>" + data.name + "</h3>");
            $('#side-content').append("<h5>" + data._id + "</h5>");
        });
    }
}

/**
 * Saves Grammar to LocalStorage
 */
function saveGrammar() {
    window.localStorage.setItem('barbara-vm-grammar', grammar_cm.getValue());
}

/**
 * SideNav Controls
 */
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

/**
 * Code Mirror Setup
 */

var grammar_cm = CodeMirror.fromTextArea(document.getElementById("grammar"), {
    mode: "pegjs",
    // Darkmode
    autoRefresh: true,
    theme: "darcula",
    lineWrapping: true,
    lineNumbers: true,
    styleActiveLine: true,
    matchBrackets: true,
    styleActiveSelected: true,
    continueLineComment: true,
    continueComments: "Enter",
    extraKeys: {
        "Ctrl-/": "toggleComment",
        "Cmd-/": "toggleComment"
    }

});

/**
 * Example definition of a simple mode that understands a subset of
 * JavaScript:
 */
CodeMirror.defineSimpleMode("simplemode", {
    // The start state contains the rules that are intially used
    start: [
        // The regex matches the token, the token property contains the type
        {regex: /"(?:[^\\]|\\.)*?(?:"|$)/, token: "string"},
        // You can match multiple tokens at once. Note that the captured
        // groups must span the whole string in this case
        {
            regex: /(function)(\s+)([a-z$][\w$]*)/,
            token: ["keyword", null, "variable-2"]
        },
        // Rules are matched in the order in which they appear, so there is
        // no ambiguity between this one and the one above
        {
            regex: /(?:function|var|return|if|for|while|else|do|this)\b/,
            token: "keyword"
        },
        {regex: /true|false|null|undefined/, token: "atom"},
        {
            regex: /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i,
            token: "number"
        },
        {regex: /\/\/.*/, token: "comment"},
        {regex: /\/(?:[^\\]|\\.)*?\//, token: "variable-3"},
        // A next property will cause the mode to move to a different state
        {regex: /\/\*/, token: "comment", next: "comment"},
        {regex: /[-+\/*=<>!]+/, token: "operator"},
        // indent and dedent properties guide autoindentation
        {regex: /[\{\[\(]/, indent: true},
        {regex: /[\}\]\)]/, dedent: true},
        {regex: /[a-z$][\w$]*/, token: "variable"},
        // You can embed other modes with the mode property. This rule
        // causes all code between << and >> to be highlighted with the XML
        // mode.
        {regex: /<</, token: "meta", mode: {spec: "xml", end: />>/}}
    ],
    // The multi-line comment state.
    comment: [
        {regex: /.*?\*\//, token: "comment", next: "start"},
        {regex: /.*/, token: "comment"}
    ],
    // The meta property contains global information about the mode. It
    // can contain properties like lineComment, which are supported by
    // all modes, and also directives like dontIndentStates, which are
    // specific to simple modes.
    meta: {
        dontIndentStates: ["comment"],
        lineComment: "//"
    }
});


var input_cm = CodeMirror.fromTextArea(document.getElementById("input"), {
    mode: "simplemode",
    lineNumbers: true,
    lineWrapping: true,
    autoRefresh: true,
    styleActiveLine: true,
    matchBrackets: true,
    styleActiveSelected: true,
    continueLineComment: true,
    continueComments: "Enter",
    // Darkmode
    theme: "darcula",
    colorpicker: {
        mode: 'edit',
        colorSets: [
            {name: 'My Colors', colors: ['red', 'blue', 'white']},
            {name: 'Scale Colors', scale: ['red', 'yellow', 'black'], count: 5},
            {name: 'Input Colors', edit: true},
        ]
    },
    extraKeys: {
        'Cmd-/': 'toggleComment',
        'Ctrl-/': 'toggleComment',
        "Ctrl-Enter": makeParser,
        "Cmd-Enter": makeParser,
        "Shift-Enter": start,
        "Alt-Enter": exportSVG,
        "Alt-LeftClick": getCursor,
        'Ctrl-K': function (cm, event) {
            cm.state.colorpicker.popup_color_picker();
        },
        'Cmd-E': function () {
            // Hinting for patterns
            var options = {
                hint: function () {
                    return {
                        from: input_cm.getDoc().getCursor(),
                        to: input_cm.getDoc().getCursor(),
                        list: Object.keys(window.patterns)
                    }
                }
            };
            input_cm.showHint(options);
        },
        'Cmd-I': function () {
            // Hinting for mix-blend-mode options
            var options = {
                hint: function () {
                    return {
                        from: input_cm.getDoc().getCursor(),
                        to: input_cm.getDoc().getCursor(),
                        list: ["normal",
                            "multiply",
                            "screen",
                            "overlay",
                            "darken",
                            "lighten",
                            "color-dodge",
                            "color-burn",
                            "hard-light",
                            "soft-light",
                            "difference",
                            "exclusion",
                            "hue",
                            "saturation",
                            "color",
                            "luminosity"]
                    }
                }
            };
            input_cm.showHint(options);
        }
    }
});

/**
 * Open a view
 * @param id
 */
function openView(id) {
    switch (id) {
        case "grammar":
            $("#info_div").hide();
            $("#input_div").hide();
            $("#grammar_div").show();
            break;
        case "input":
            $("#info_div").hide();
            $("#input_div").show();
            $("#grammar_div").hide();
            break;
        case "information":
            $("#info_div").show();
            $("#input_div").hide();
            $("#grammar_div").hide();
            break;
    }
    currentView = id;
}

/**
 * Live Code Mode
 */
function liveCodeMode() {
    $("#drawing").toggleClass("live-code-I");
    $('body > :not(#drawing)').hide(); //hide all nodes directly under the body
    $('#drawing').appendTo('body');
    $(input_cm.getWrapperElement()).toggleClass("live-code-II").show().appendTo('body');
    $('body').append("<button id='exitLiveCode' style='margin: 5px; position: absolute; top: 0;'>X</button>");

    $("#exitLiveCode").click(function () {
        $("#drawing").toggleClass("live-code-I").appendTo("#drawing-container");
        $(input_cm.getWrapperElement()).toggleClass("live-code-II").insertAfter("#input");
        input_cm.setOption("lineNumbers", false);
        $('body > :not(script)').show(); //hide all nodes directly under the body
        $("#exitLiveCode").remove();

        // Stop other elements from showing
        tweet_modal.style.display = "none";
        modal.style.display = "none";
        converter.style.display = "none";

        // Take back to last view
        openView(currentView);
    })
}

/**
 * Markdown Editor
 */
var markdown_cm = CodeMirror.fromTextArea(document.getElementById("markdown"), {
    mode: "gfm",
    autoRefresh: true,
    lineNumbers: true,
    theme: "darcula",
    lineWrapping: true,
    styleActiveLine: true
});

markdown_cm.on("change", function (cm, change) {
    document.getElementById('markdown_render').innerHTML = marked(cm.getValue());
});

/**
 * Slider setup
 */
var htmlNode;

function getCursor() {
    console.log(input_cm.getCursor());

    var A1 = input_cm.getCursor().line;
    var A2 = input_cm.getCursor().ch;

    var B1 = input_cm.findWordAt({line: A1, ch: A2}).anchor.ch;
    var B2 = input_cm.findWordAt({line: A1, ch: A2}).head.ch;

    let range = input_cm.getRange({line: A1, ch: B1}, {line: A1, ch: B2});
    console.log(range);

    // If it's a number
    if (range.match(/^[0-9]+$/) != null) {
        if (htmlNode) htmlNode.parentNode.removeChild(htmlNode);

        var min = prompt("What is the min val?");
        if (!min) return;
        var max = prompt("What is the max val?", "0");
        if (!max) return;

        min = parseInt(min);
        max = parseInt(max);

        htmlNode = document.createElement("input");
        htmlNode.id = "volume";
        htmlNode.type = 'range';
        htmlNode.min = min;
        htmlNode.max = max;
        htmlNode.value = 0;
        htmlNode.step = 1;

        input_cm.addWidget({ch: A2, line: A1}, htmlNode, true);
        htmlNode.onchange = function () {
            input_cm.replaceRange(this.value, {line: A1, ch: B1}, {line: A1, ch: B2});
            B2 = B1 + this.value.length;
            makeParser(true);
            start();
        };
    }
}


/**
 * PEG
 */
function makeParser(del) {
    if (del !== true) {
        if (htmlNode) {
            htmlNode.parentNode.removeChild(htmlNode);
            htmlNode = undefined;
        }
    }

    let grammar = grammar_cm.getValue();
    var parser = peg.generate(grammar);

    // TODO: Commenting defined through grammar?
    // trim whitespaces and remove commented out lines
    let input = input_cm.getValue().trim().replace(/(?:\/\*(?:[\s\S]*?)\*\/)|(?:[\s;]+\/\/(?:.*)$)/gm, '');

    // TODO: Check error checking?
    try {
        let res = parser.parse(input);
        console.log(res);
        // console.log(res);
        $("#output").val(JSON.stringify(res));
    } catch (ex) {
        console.log(ex.message);
        $("#output").val(ex.message);
    }
}

function start(clear) {
    if (clear === undefined) clear = true;
    let val = $("#output").val();

    if (val === "Expected start but end of input found.") {
        return;
    }

    if (!val) {
        alert("Please parse first!");
        return;
    }
    val = eval(val);
    window.seq.define("default", val, "#drawing", clear);
}

/**
 * Loop the SVG
 */
function loopSVG() {
    if (looping) {
        looping = false;
        clearInterval(interval);
        $("#loop").text("Start Loop");
    } else {
        looping = true;
        interval = setInterval(function () {
            makeParser();
            start();
        }, 1000);
        $("#loop").text("Stop Loop");
    }
}

/**
 * Parses the url query
 */
function parseQuery(queryString) {
    var query = {};
    var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return query;
}

/**
 * Exports the SVG
 */
function exportSVG() {

    let parentId;
    if (window.location.search) {
        let res = parseQuery(window.location.search);
        console.log(res.id);
        parentId = res.id;
    }

    let response = prompt("What do you want to call this?.");

    if (response == "" || response == null) {
        console.log("Not saving");
        return;
    }

    $.getJSON("loggeduser", function (data) {
        // Make sure the data contains the username as expected before using it
        if (data.hasOwnProperty('username')) {
            $.post("savesession", {
                grammar: grammar_cm.getValue(),
                input: input_cm.getValue(),
                output: $("#output").val(),
                svg: window.svg,
                name: response,
                user: data.username._id,
                markdown: markdown_cm.getValue(),
                parent: parentId
            }).done(function (data) {
                // Some errors with this in the past, check later
                // originalData = JSON.parse(JSON.stringify(data));
                console.log(data);
                // exportID = data._id;

                // TODO: Make sure it is okay to refresh the page...
                window.location.href = "editor?id=" + data;
            });
        } else {
            $.post("savesession", {
                grammar: grammar_cm.getValue(),
                input: input_cm.getValue(),
                output: $("#output").val(),
                svg: window.svg,
                name: response,
                markdown: markdown_cm.getValue(),
                parent: parentId
            }).done(function (data) {
                // Some errors with this in the past, check later
                // originalData = JSON.parse(JSON.stringify(data));
                console.log(data);
                // exportID = data._id;

                // TODO: Make sure it is okay to refresh the page...
                window.location.href = "editor?id=" + data;
            });
        }
    });
}

function updateSVG() {
    // TODO: Check if user is owner?
}

function triggerDownload(imgURI) {
    var evt = new MouseEvent('click', {
        view: window,
        bubbles: false,
        cancelable: true
    });

    var a = document.createElement('a');
    a.setAttribute('download', 'barbara_pattern.png');
    a.setAttribute('href', imgURI);
    a.setAttribute('target', '_blank');

    a.dispatchEvent(evt);
}

/**
 * Tweet
 */
function tweet() {
    if (!exportID) {
        alert("Make sure you export first!");
        return;
    } else {
        // there is an id, check that there has been a change
        // TODO: Better fix
        if (window.svg) {
            console.log(window.svg);
            console.log(originalData.svg);
            console.log(originalData);
            if (window.svg !== originalData.svg) {
                console.log("1")
                alert("Change detected! Make sure you export first!");
                return;
            }
        }

        if (!(grammar_cm.getValue() === originalData.grammar && input_cm.getValue() === originalData.input && markdown_cm.getValue() === originalData.markdown
            && $("#output").val() === originalData.output)) {
            console.log("2")
            alert("Change detected! Make sure you export first!");
            return;
        }
    }

    // Convert to PNG
    var canvas = document.getElementById('converter');
    canvas.style.display = "none";

    canvas.height = 800;
    canvas.width = 800;
    var ctx = canvas.getContext('2d');
    console.log(window.svg);
    // var data = (new XMLSerializer()).serializeToString(window.svg);
    var data = window.svg;
    var DOMURL = window.URL || window.webkitURL || window;

    var img = new Image();
    var svgBlob = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
    var url = DOMURL.createObjectURL(svgBlob);

    img.onload = function () {
        ctx.drawImage(img, 0, 0);
        DOMURL.revokeObjectURL(url);

        var imgURI = canvas
            .toDataURL('image/png')
            .replace('image/png', 'image/octet-stream');

        console.log(exportID);
        let name = prompt("What is your name?");

        if (name === "" || name == null) {
            console.log("Not saving");
            return;
        }

        $.post("tweet", {
            name: name,
            id: exportID,
            img: imgURI
        }).done(function (data) {
            document.getElementById("tweet_modal").style.display = "block";
            document.getElementById("tweet_content").innerText = "Successfully created tweet at https://twitter.com/barbara_quilts/status/" + data.id;
        });
    };

    img.src = url;
}

/**
 * Check for link from a pattern
 */
if (window.location.search) {
    let res = parseQuery(window.location.search);
    console.log(res.id);
    exportID = res.id;

    $.getJSON("sessions/" + res.id, function (data) {

        if (data.status === "no") {
            // No results found
            window.location.href = "editor";
        }

        originalData = JSON.parse(JSON.stringify(data));

        $("#output").val(data.output);
        grammar_cm.setValue(data.grammar);
        input_cm.setValue(data.input);
        markdown_cm.setValue(data.markdown);
        window.svg = data.svg;

        // backwards compatibility with older SVGs saved
        if (!data.svg.startsWith("<svg")) {
            document.getElementById('drawing').innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:svgjs=\"http://svgjs.com/svgjs\" width=\"800\" height=\"800\" viewBox=\"0 0 800 800\">" + data.svg + "</svg>";
        } else {
            document.getElementById('drawing').innerHTML = data.svg;
        }

        openView('input');

        // alternative to loading SVG directly
        // makeParser();
        // start();
    }).fail(err => console.log(err));

} else if (window.localStorage.getItem('barbara-vm-grammar')) {
    // TODO: Remove or reconsider local storage
    // grammar_cm.setValue(window.localStorage.getItem('barbara-vm-grammar'));
}

var user;

/**
 * User Functions
 */
$.getJSON("loggeduser", function (data) {
    // Set title to username
    if (data.username) {
        user = data.username;
        $("#username_placeholder").text(data.username.username);
        $("#account").empty();
        $("#account").append("<h3> Welcome, " + data.username.username + "</h3>");
        $("#account").append(' <form action="/logout" method="get">\n' +
            '        <button type="submit">logout</button>\n' +
            '    </form>');

        console.log(data.username._id);
        loadMenus(data.username._id);
    }
});

function logout() {
    $.ajax({
        url: '/logout',
        type: 'get',
        success: function (data) {
            window.location = "editor";
        }
    });
}

function deleteSession(id) {
    if (confirm("Are you sure you want to delete?")) {
        $.ajax({
            url: '/session/' + id,
            type: 'delete',
            success: function (data) {
                if (data.status === "ok") {
                    console.log(user._id);

                    // reload menu
                    loadMenus(user._id);
                }
            }
        });
    }
}

function loadMenus(userId) {
    // Add sessions to Load option
    $.getJSON("sessions/user/" + userId, function (data) {
        $("#user_session_list").empty();
        $("#user_session_list_delete").empty();

        for (let s of data.sessions) {
            $("#user_session_list").append("<li><a onclick=\"window.location.href='editor?id=" + s._id + "'\">" + s.name + "</a></li>");
            $("#user_session_list_delete").append("<li><a onclick=\"deleteSession('" + s._id + "')\">" + s.name + "</a></li>");

        }
    });
}


function open3D() {
    console.log(exportID);
    if (exportID) {
        window.location = "3d/threejs.html?id=" + exportID;
    } else {
        alert("Make sure you export the pattern first.")
    }
}

function downloadImage() {
    var ctx = converter.getContext('2d');
    var data = window.svg;
    var DOMURL = window.URL || window.webkitURL || window;

    var img = new Image();
    var svgBlob = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
    var url = DOMURL.createObjectURL(svgBlob);

    img.onload = function () {
        ctx.drawImage(img, 0, 0);
        DOMURL.revokeObjectURL(url);

        var imgURI = converter
            .toDataURL('image/png')
            .replace('image/png', 'image/octet-stream');

        triggerDownload(imgURI);
    };

    img.src = url;
}

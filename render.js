document.renderSnap = function () {
    const snap = document.snap;
    const nodes = {
        "mon#1": {
            group: "mon",
            key: "1",
            render: false,
            level: 4,
            label: "<b>Monitor 1</b>",
            hash: "mon#1"
        }, "mon#2": {
            group: "mon",
            key: "2",
            render: false,
            level: 4,
            label: "<b>Monitor 2</b>",
            hash: "mon#2"
        }
    };
    const connections = [];

    const inputs = parseInputs(snap, nodes);
    const outputs = parseOutputs(snap, nodes, connections);

    const channels = parseChannelsAndBusses("ch", snap, nodes, connections);
    const aux = parseChannelsAndBusses("aux", snap, nodes, connections);
    const busses = parseChannelsAndBusses("bus", snap, nodes, connections);

    const main = parseMainAndMatrix("main", snap, nodes, connections);
    const mtx = parseMainAndMatrix("mtx", snap, nodes, connections);

    var edgesArray = [];
    connections.forEach(x => {
        if (!x.active) return;
        x.from = x.from.toLowerCase();
        x.to = x.to.toLowerCase();
        if (!nodes[x.from] || !nodes[x.to]) {
            debugger;
        }
        nodes[x.from].render = true;
        nodes[x.to].render = true;
        edgesArray.push({
            from: x.from,
            to: x.to
        })
    })

    var vertexArray = []
    Object.keys(nodes).forEach(xk => {
        const x = nodes[xk]
        if (!x.render) return;
        vertexArray.push({
            id: x.hash,
            label: x.label ? x.label : x.hash,
            group: x.group,
            level: x.level,
            shape: x.shape ? x.shape : "ellipse"
        })
    })

    // create an array with nodes
    var vertexes = new vis.DataSet(vertexArray);

    // create an array with edges
    var edges = new vis.DataSet(edgesArray);

    // create a network
    var container = document.getElementById('mynetwork');

    // provide the data in the vis format
    var data = {
        nodes: vertexes,
        edges: edges
    };
    var options = {
        interaction: {
            navigationButtons: true,
        },
        physics: {
            hierarchicalRepulsion: {
                avoidOverlap: 1
            },
        },
        edges: {
            arrows: "to"
        },
        nodes: {
            font: {
                multi: true
            }
        },
        layout: {
            improvedLayout: true,
            hierarchical: {
                enabled: true,
                //  direction: "DU",
                sortMethod: "hubsize",
                parentCentralization: false,
                shakeTowards: "roots",
                blockShifting: false,
                edgeMinimization: true,
                treeSpacing:100,
                nodeSpacing:150
            }
        }
    };

    // initialize your network!
    var network = new vis.Network(container, data, options);


    document.getElementById('output').textContent = JSON.stringify(connections, null, 2);





};


function parseMainAndMatrix(type, snap, nodes, connections) {
    let channels = [];

    for (let i = 1; i <= 8; i++) {
        const key = i.toString();
        if (!snap.ae_data[type].hasOwnProperty(key)) continue;
        var lclData = snap.ae_data[type][key];
        var typelong = type == "main" ? "Main" : "Matrix";
        const obj = {
            group: type,
            key: key,
            data: lclData,
            render: false,
            level: type == "main" ? 4 : 5,
            label: "<b>" + lclData.name + "</b>\r\n" + typelong + " " + key,
            hash: (type + "#" + key).toLowerCase()
        }
        nodes[obj.hash] = obj;
        channels.push(obj);
        //sends
        if (type == "main") {
            for (let m = 1; m <= 8; m++) {
                if (lclData.send["MX" + m.toString()].on) {
                    connections.push({
                        from: obj.hash,
                        to: "mtx#" + m,
                        "type": "mtxsend",
                        active: true
                    })
                }
            }
        }
    }

    return channels;
}

function pickShape(type){
    switch(type){
        case "bus": return "database";
        case "ch": return "ellipse";
        default :return "circle";
    }
}

function parseChannelsAndBusses(type, snap, nodes, connections) {
    let channels = [];

    for (let i = 1; i <= 50; i++) {
        const key = i.toString();
        if (!snap.ae_data[type].hasOwnProperty(key)) continue;
        var lclData = snap.ae_data[type][key];
        let xl = "<b>" + lclData.name + "</b>\r\n" + "" + shortToLong(type) + " " + key + "";
        if (!(lclData.name?.trim())) {
            xl = "<b>" + "" + shortToLong(type) + " " + key + "</b>"
        }
        const obj = {
            group: type,
            key: key,
            data: lclData,
            shape: pickShape(type),
            render: false,
            level: type == "bus" ? 3 : 2,
            hash: (type + "#" + key).toLowerCase(),
            label: xl
        }
        nodes[obj.hash] = obj;
        channels.push(obj);
        if (type != "bus") {
            //main in
            if (lclData.in.conn.grp != "OFF") {

                connections.push({
                    from: "in#" + lclData.in.conn.grp + "#" + lclData.in.conn.in,
                    to: obj.hash,
                    "type": "mainin",
                    active: !lclData.in.set.altsrc
                })

            }
            if (lclData.in.conn.altgrp != "OFF") {
                //alt in
                connections.push({
                    from: "in#" + lclData.in.conn.altgrp + "#" + lclData.in.conn.altin,
                    to: obj.hash,
                    "type": "altin",
                    active: lclData.in.set.altsrc
                })

            }
        }
        //mains
        for (let m = 1; m <= 4; m++) {
            if (lclData.main[m.toString()].on) {
                connections.push({
                    from: obj.hash,
                    to: "main#" + m,
                    "type": "mainsend",
                    active: true
                })
            }
        }
        //sends
        for (let m = 1; m <= (type != "bus" ? 16 : 8); m++) {
            if (lclData.send[m.toString()].on) {
                connections.push({
                    from: obj.hash,
                    to: "bus#" + m,
                    "type": "bussend",
                    active: true
                })
            }
            if (type == "bus" && m <= 8) {
                if (lclData.send["MX" + m.toString()].on) {
                    connections.push({
                        from: obj.hash,
                        to: "mtx#" + m,
                        "type": "mtxsend",
                        active: true
                    })
                }
            }
        }
    }

    return channels;
}

function shortToLong(s) {
    switch (s) {
        case "LCL": return "Local";
        case "AUX": return "Aux";
        case "A": return "AES50 A";
        case "B": return "AES50 B";
        case "C": return "AES50 C";
        case "SC": return "Stage Con.";
        case "USB": return "USB";
        case "CRD": return "Card";
        case "MOD": return "Module";
        case "PLAY": return "USB Player";
        case "AES": return "AES/EBU";
        case "USR": return "User";
        case "OSC": return "Oscilator";
        case "REC": return "Recorder";
        default: return s;
    }
}


function parseInputs(snap, nodes) {
    let inputs = [];
    const inputNames = [
        "LCL",
        "AUX",
        "A",
        "B",
        "C",
        "SC",
        "USB",
        "CRD",
        "MOD",
        "PLAY",
        "AES",
        "USR",
        "OSC"
    ];
    inputNames.forEach(group => {
        for (let i = 1; i <= 50; i++) {
            const key = i.toString();
            if (snap.ae_data.io.in[group].hasOwnProperty(key)) {
                var lclData = snap.ae_data.io.in[group][key];
                let xl = "<b>" + lclData.name + "</b>\r\n" + "In " + shortToLong(group) + " " + key + "";
                if (!(lclData.name?.trim())) {
                    xl = "<b>" + "In " + shortToLong(group) + " " + key + "</b>"
                }
                const obj = {
                    group: group,
                    key: key,
                    data: lclData,
                    render: false,
                    level: 1,
                    label: xl,
                    hash: ("in#" + group + "#" + key).toLowerCase(),
                    shape: "box"
                }
                nodes[obj.hash] = obj;
                inputs.push(obj);

            }
        }

    });
    return inputs;
}


function parseOutputs(snap, nodes, connections) {
    let outputs = [];
    const outputNames = [
        "LCL",
        "AUX",
        "A",
        "B",
        "C",
        "SC",
        "USB",
        "CRD",
        "MOD",
        "REC",
        "AES"
    ];

    outputNames.forEach(group => {
        for (let i = 1; i <= 50; i++) {
            const key = i.toString();
            if (snap.ae_data.io.out[group].hasOwnProperty(key)) {
                var lclData = snap.ae_data.io.out[group][key];
                let xl = "<b>" + lclData.name + "</b>\r\n" + "Out " + shortToLong(group) + " " + key + "";
                if (!(lclData.name?.trim())) {
                    xl = "<b>" + "Out " + shortToLong(group) + " " + key + "</b>"
                }
                const obj =
                {
                    group: group,
                    key: key,
                    data: lclData[key],
                    render: false,
                    level: 6,
                    label: xl,
                    hash: ("out#" + group + "#" + key).toLowerCase(),
                    shape: "triangle"
                }
                nodes[obj.hash] = obj;
                outputs.push(obj);
                if (lclData.grp && lclData.grp !== "OFF") {
                    var locIn = lclData.in;
                    var locGrp = lclData.grp;
                    if (lclData.grp == "MTX"||lclData.grp == "MAIN") locIn =Math.ceil(lclData.in / 2) //matrixes are seen as stereo apris, so matrix 2 is actually the right channel of matrix 1
                    if (lclData.grp == "USR") locGrp = "in#usr"

                    connections.push({
                        from: (locGrp + "#" + locIn).toLowerCase(),
                        to: obj.hash,
                        "type": "out",
                        active: true
                    })
                }
            }
        }

    });
    return outputs;
}
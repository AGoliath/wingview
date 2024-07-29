document.renderSnap = function (connections, nodes) {


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

    // render the network
    var vertexes = new vis.DataSet(vertexArray);
    var edges = new vis.DataSet(edgesArray);
    var container = document.getElementById('mynetwork');
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
                avoidOverlap: 1,
                nodeDistance:300
            },
        },
        edges: {
            color: {
                opacity: 0.3
            },
            arrows: "to",
            arrowStrikethrough: false,
            hoverWidth: function (width) {return width*2.4;},
            selectionWidth: function (width) {return width*2.4;},
            chosen:{
                edge: function(values, id, selected, hovering) {
                    values.color = "#FF0000";
                    values.width= 4;
                    values.opacity = 1;
                    values.shadow = true;
                    values.shadowColor = "#FFFF00";
                    values.shadowBlur = 20;
                  }
                }
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
                shakeTowards: "leaves",
                blockShifting: false,
                edgeMinimization: false,
                treeSpacing: 100,
                nodeSpacing: 150
            }
        }
    };
    var network = new vis.Network(container, data, options);


    //document.getElementById('output').textContent = JSON.stringify(connections, null, 2);





};

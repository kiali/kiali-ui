/*
  KialiBreadthFirstLayout

  This is a version of the "breadthfirst" algorithm provided by Cytoscape at
  https://github.com/cytoscape/cytoscape.js/blob/unstable/src/extensions/layout/breadthfirst.js

  The standard algorithm needs some refinements for Kiali use cases and in this case it's simpler to clone it
  rather than provide an extension.

 */

const defaults = {
  fit: true, // whether to fit the viewport to the graph
  padding: 30, // padding on fit
  spacingFactor: 1, // positive spacing factor, larger => more space between nodes (N.B. n/a if causes overlap)
  boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
  avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
  nodeDimensionsIncludeLabels: false, // Excludes the label when calculating node bounding boxes for the layout algorithm
  animate: false, // whether to transition the node positions
  animationDuration: 500, // duration of animation in ms if enabled
  animationEasing: undefined, // easing of animation if enabled,
  animateFilter: function (_node, _i) {
    return true;
  }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
  ready: undefined, // callback on layoutready
  stop: undefined, // callback on layoutstop
  transform: function (_node, position) {
    return position;
  } // transform a given node position. Useful for changing flow direction in discrete layouts
};

const getInfo = ele => ele.scratch('breadthfirst');
const setInfo = (ele, obj) => ele.scratch('breadthfirst', obj);

export default class KialiBreadFirstLayout {
  readonly cy;
  readonly eles;
  readonly options;

  constructor(options: any) {
    this.cy = options.cy;
    this.eles = options.eles;
    this.options = Object.assign({}, defaults, options);
  }

  /**
   * This code gets executed on the cy.layout(...).  run() is the entrypoint of this algorithm.
   */
  run() {
    var eles = this.eles;
    var nodes = eles.nodes().not(':parent');
    var graph = eles;
    var options = this.options;

    // Calculate roots from targets
    // node.roots() doesn't work with componse nodes
    var targetIds = eles.edges().map(e => e.target().id());
    var roots = nodes.filter(n => !targetIds.includes(n.id()));

    var depths: any = [];
    var foundByBfs = {};

    var addToDepth = (ele, d) => {
      if (depths[d] == null) {
        depths[d] = [];
      }

      var i = depths[d].length;

      depths[d].push(ele);

      setInfo(ele, {
        index: i,
        depth: d
      });
    };

    // find the depths of the nodes
    graph.bfs({
      roots: roots,
      directed: true,
      visit: function (node, _edge, _pNode, _i, depth) {
        let ele = node[0];
        let id = ele.id();

        addToDepth(ele, depth);
        foundByBfs[id] = true;
      }
    });

    // check for nodes not found by bfs
    var orphanNodes: any = [];
    for (var i = 0; i < nodes.length; i++) {
      var ele = nodes[i];

      if (foundByBfs[ele.id()]) {
        continue;
      } else {
        orphanNodes.push(ele);
      }
    }

    // assign the nodes a depth and index

    var assignDepthsAt = function (i) {
      var eles = depths[i];

      for (var j = 0; j < eles.length; j++) {
        var ele = eles[j];

        if (ele == null) {
          eles.splice(j, 1);
          j--;
          continue;
        }

        setInfo(ele, {
          depth: i,
          index: j
        });
      }
    };

    var assignDepths = function () {
      for (var i = 0; i < depths.length; i++) {
        assignDepthsAt(i);
      }
    };

    assignDepths(); // clear holes

    var sortNameFn = function (a, b) {
      // Use id as default
      var aName = a.id();
      var bName = b.id();

      if (a.data('workload')) {
        aName = a.data('workload');
      } else if (a.data('service')) {
        aName = a.data('service');
      } else if (a.data('app')) {
        aName = a.data('app');
      } else if (a.data('namespace')) {
        aName = a.data('namespace');
      }

      if (b.data('workload')) {
        bName = b.data('workload');
      } else if (b.data('service')) {
        bName = b.data('service');
      } else if (b.data('app')) {
        bName = b.data('app');
      } else if (b.data('namespace')) {
        bName = b.data('namespace');
      }

      return aName.localeCompare(bName);
    };

    // sort each level to make connected nodes closer
    for (i = 0; i < depths.length; i++) {
      // Sort elements by name in each row
      depths[i].sort(sortNameFn);
      assignDepthsAt(i);
    }

    // assign orphan nodes to a new top-level depth
    var orphanDepth: any = [];
    for (i = 0; i < orphanNodes.length; i++) {
      orphanDepth.push(orphanNodes[i]);
    }
    depths.unshift(orphanDepth);

    assignDepths();

    // Precaltulated positions per level and index
    // It will calculate
    var layoutPositions: any = [
      [] // Depth 0 is reserved
    ];

    if (depths.length > 0) {
      // Init the max width and height per level/row
      var maxHWPerDepth: any = depths.map(_ => {
        return {
          maxw: 0,
          maxh: 0
        };
      });
      // Loop to calculate the max width and height per level/row
      nodes.forEach(n => {
        var { depth } = getInfo(n);
        var nbb = n.layoutDimensions(options);
        var w = nbb.w;
        var h = nbb.h;
        if (w > maxHWPerDepth[depth].maxw) {
          maxHWPerDepth[depth].maxw = w;
        }
        if (h > maxHWPerDepth[depth].maxh) {
          maxHWPerDepth[depth].maxh = h;
        }
      });

      var posX = 0;
      var posY = 0;
      var splitOverflow = depths.length - 1;
      // Iterate per levels (skipping 0 that is reserved)
      for (i = 1; i < depths.length; i++) {
        var level = depths[i];
        var positions: any = [];

        // Overflow ?
        var isOverflow = false;
        if (level.length >= depths.length * 2) {
          isOverflow = true;
          // Special case where there is one single row (i.e. no edges)
          if (splitOverflow === 1) {
            splitOverflow = Math.round(Math.sqrt(level.length));
          }
        }

        // Iterate per row
        // SplitJ is an index to manage the overflow of the lines
        var lineMaxH = 0;
        var lineOverflowH = 0;
        for (var j = 0, splitJ = 0; j < level.length; j++, splitJ++) {
          var lbb = level[j].layoutDimensions(options);
          if (lbb.h > lineMaxH) {
            lineMaxH = lbb.h;
          }

          if (isOverflow && splitJ > splitOverflow) {
            // Reset the posX position
            posX = 0;
            // Increment the posY for the current splitted line
            // 1/2 of current line
            posY += Math.round(lineMaxH / 2);
            // 1/2 of next line
            var nextLineMaxH = 0;
            for (var nextj = j; nextj < depths.length || nextj < level.length; nextj++) {
              var nlbb = level[nextj].layoutDimensions(options);
              if (nlbb.h > nextLineMaxH) {
                nextLineMaxH = nlbb.h;
              }
            }
            posY += Math.round(nextLineMaxH / 2);
            splitJ = 0;
            lineOverflowH = lineMaxH;
            lineMaxH = 0;
            nextLineMaxH = 0;
          }
          var pos = {
            x: posX,
            y: posY
          };
          posX += maxHWPerDepth[i].maxw;
          positions.push(pos);
        }
        posX = 0;

        // Last line in overflow cases
        if (isOverflow) {
          posY += Math.round(lineOverflowH / 2);
        } else {
          posY += Math.round(maxHWPerDepth[i].maxh / 2);
        }
        if (i + 1 < depths.length) {
          posY += Math.round(maxHWPerDepth[i + 1].maxh / 2);
        }
        // Position per row
        layoutPositions.push(positions);
        isOverflow = false;
      }
    }

    var getPosition = function (ele) {
      var { depth, index } = getInfo(ele);
      return layoutPositions[depth][index];
    };

    eles.nodes().layoutPositions(this, options, getPosition);

    return this;
  }

  /**
   * This is a stub required by cytoscape to allow the layout impl to emit events
   * @param _events space separated string of event names
   */
  emit(_events) {
    // intentionally empty
  }
}

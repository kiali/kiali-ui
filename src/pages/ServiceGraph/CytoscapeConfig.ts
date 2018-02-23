export class CytoscapeConfig {
  static getStyles() {
    return [
      {
        selector: 'node',
        style: {
          width: 300,
          height: 300,
          content: 'data(label)',
          //          'text-opacity': 0.5,
          'text-valign': 'center',
          color: 'white',
          'background-color': '#bbb',
          'text-outline-width': 2,
          'text-outline-color': '#999'
        }
      },

      {
        selector: 'edge',
        style: {
          width: 10,
          content: 'data(label)',
          'target-arrow-shape': 'triangle',
          'line-color': 'data(color)',
          'target-arrow-color': '#9dbaea'
        }
      },

      {
        selector: ':selected',
        style: {
          'background-color': 'yellow',
          'line-color': 'yellow',
          'target-arrow-color': 'black',
          'source-arrow-color': 'black'
        }
      },

      {
        selector: 'edge:selected',
        style: {
          width: 20
        }
      }
    ];
  }
}

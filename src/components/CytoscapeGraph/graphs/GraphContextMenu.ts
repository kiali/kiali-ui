import history from '../../../app/History';

export class GraphContextMenu {
  static menuOptions() {
    return {
      menuRadius: 100, // the radius of the circular menu in pixels
      selector: 'node', // elements matching this Cytoscape.js selector will trigger cxtmenus
      commands: [
        // an array of commands to list in the menu or a function that returns the array
        {
          fillColor: 'rgba(200, 200, 200, 0.75)', // optional: custom background color for item
          content: 'Detailed View',
          contentStyle: {}, // css key:value pairs to set the command's css in js if you want
          select: ele => {
            // a function to execute when the command is selected
            console.log('Context Menu Detailed view tap and hold on:' + ele.id());
            this.showDetailsPage(ele);
          },
          enabled: true // whether the command is selectable
        },
        {
          fillColor: 'rgba(200, 200, 200, 0.75)', // optional: custom background color for item
          content: 'Zoom In',
          contentStyle: {}, // css key:value pairs to set the command's css in js if you want
          select: ele => {
            // a function to execute when the command is selected
            console.log('Context Menu Zoom In tap and hold');
          },
          enabled: true // whether the command is selectable
        },
        {
          fillColor: 'rgba(200, 200, 200, 0.75)', // optional: custom background color for item
          content: 'Hide',
          contentStyle: {}, // css key:value pairs to set the command's css in js if you want
          select: ele => {
            // a function to execute when the command is selected
            console.log('Context Menu Hide tap and hold');
          },
          enabled: false // whether the command is selectable
        }
      ], // function( ele ){ return [ /*...*/ ] }, // example function for commands
      fillColor: 'rgba(0, 0, 0, 0.75)', // the background colour of the menu
      activeFillColor: 'rgba(1, 105, 217, 0.75)', // the colour used to indicate the selected command
      activePadding: 20, // additional size in pixels for the active command
      indicatorSize: 24, // the size in pixels of the pointer to the active command
      separatorWidth: 3, // the empty spacing in pixels between successive commands
      spotlightPadding: 4, // extra spacing in pixels between the element and the spotlight
      minSpotlightRadius: 24, // the minimum radius in pixels of the spotlight
      maxSpotlightRadius: 38, // the maximum radius in pixels of the spotlight
      openMenuEvents: 'cxttapstart taphold', // space-separated cytoscape events that will open the menu; only `cxttapstart` and/or `taphold` work here
      itemColor: 'white', // the colour of text in the command's content
      itemTextShadowColor: 'transparent', // the text shadow colour of the command's content
      zIndex: 9999, // the z-index of the ui div
      atMouse: false // draw menu at mouse position
    };
  }

  private static showDetailsPage(element: any) {
    const data = element._private.data;
    const namespace = data.namespace;
    const nodeType = data.nodeType;
    const workload = data.workload;
    let app = data.app;
    let urlNodeType = app;

    if (nodeType === 'app') {
      urlNodeType = 'applications';
    } else if (nodeType === 'service') {
      urlNodeType = 'services';
    } else if (workload) {
      urlNodeType = 'workloads';
      app = workload;
    }
    const detailsPageUrl = `/namespaces/${namespace}/${urlNodeType}/${app}`;
    console.info(`Routing to details page: ${detailsPageUrl}`);
    history.push(detailsPageUrl);
  }
}

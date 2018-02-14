// Allows us to not use a traditional <div> tag to return results (which can cause rendering issues)
// this gives us a div less wrapper around child components

const divlessWrapper = (props) => props.children;

export default divlessWrapper;
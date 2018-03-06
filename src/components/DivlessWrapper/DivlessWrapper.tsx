// Allows us to not use a traditional <div> tag to return results (which can cause rendering issues)
// this gives us a div less wrapper around child components
// In a medium sized app this will eliminated thousands of unneeded divs.

const DivlessWrapper = (props: any) => props.children;

export default DivlessWrapper;

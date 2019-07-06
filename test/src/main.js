console.log('let\'s test the pragma plugin >>>');
// #if  $['DEBUG'] === true
console.log("DEBUG was -ON-");
// #else
console.log('(No debug - as else condition)');
//   #endif 

// #if  $['DEBUG'] === false
console.log("DEBUG was -OFF-");
// #else
console.log('(Debug - as else condition)');
//   #endif 


// #if $['DEBUG'] === false
console.log('Debug is OFF -- NO else condition');
// #endif

// #if $['DEBUG'] === true
console.log('Debug is ON -- NO else condition');
// #endif

// #if $['SOMEOTHERVALUE']
console.log('this shouldnt run');
// #endif
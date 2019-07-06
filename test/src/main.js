console.log('let\'s test the pragma plugin >>>');
// #if  $['DEBUG'] === true
console.log("DEBUG was ON");
// #else
console.log('(No debug - as else condition)');
//   #endif 

// #if $['DEBUG'] === false
console.log('Debug is OFF -- explicitly set');
// #endif

// #if $['DEBUG'] === true
console.log('Debug is ON -- explicitly set');
// #endif

// #if $['SOMEOTHERVALUE']
console.log('this shouldnt run');
// #endif
console.log('let\'s test the pragma plugin >>>');

// #if  $['DEBUG'] === true
console.log('1) DEBUG was -ON-');
console.log('1) // do some debug stuff');
// #else
console.log('1) (No debug - as else condition)');
console.log('1) // keep quiet :)');
//   #endif 

// #if  $['DEBUG'] === false
console.log('2) DEBUG was -OFF-');
// #else
console.log('2) (Debug - as else condition)');
//   #endif 


// #if $['DEBUG'] === false
console.log('3) Debug is OFF -- NO else condition');
// #endif

// #if $['DEBUG'] === true
console.log('4) Debug is ON -- NO else condition');
// #endif

// #if $['SOMEOTHERVALUE']
console.log('5) this shouldnt run');
// #endif
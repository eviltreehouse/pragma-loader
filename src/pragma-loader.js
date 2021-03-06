'use strict';
const os = require('os');
const loaderUtils = require('loader-utils');

const OPTKEY_USEENV = '$env';
const OPTKEY_DELETE = '$delete';
const LINE_REMOVE = "/* @deleteme-pragma-loader! */";

var deleteFilteredBlocks = false;

function getPredicate(line) {
  return /\/\/\s+#if\s+(.*)/.exec(line)[1];
}

function searchBlocks(sourceByLine) {
  const blocks = [];
  let current = 0;
  let openCurrent = null;

  const startBlock = /\/\/\s+#if\s+.*/;
  const elseBlock  = /\/\/\s+#else\s*$/;
  const endBlock = /\/\/\s+#endif\s*$/;

  while (current < sourceByLine.length) {
    if (startBlock.test(sourceByLine[current])) {
      blocks[current] = {
        type: 'begin',
        predicate: getPredicate(sourceByLine[current]),
        hasElse: false
      };

      openCurrent = current;
      current += 1;
      continue;
    }

    if (elseBlock.test(sourceByLine[current])) {
      blocks[openCurrent].hasElse = true; /** @todo not sure if we need this... */

      blocks[current] = {
        'type': 'else',
        'prev_begin': openCurrent
      };
      
      current += 1;
      continue;
    }

    if (endBlock.test(sourceByLine[current])) {
      blocks[current] = {
        type: 'end'
      };

      openCurrent = null;
      current += 1;
      continue;
    }

    current += 1;
  }

  return blocks;
}

function getTruthyBlocks(blocks, loader_opts) {
  const truthyBlocks = blocks.slice();
  let i = 0;
  let action = '';

  var $ = Object.assign({}, loader_opts);

  while (i < truthyBlocks.length) {
    if (truthyBlocks[i] && truthyBlocks[i].type === 'begin') {
      let predCheck = eval(truthyBlocks[i].predicate);

      if (truthyBlocks[i].hasElse) {
        if (predCheck) { // (IF == true - delete IF block)
          truthyBlocks[i] = undefined;
        } else {          // (IF === false - delete ELSE block)
          action = 'deleteNextElseBlock';
        }
      } else if (predCheck) {
        truthyBlocks[i] = undefined;
        action = 'deleteNextEndBlock';
      }

    } else if (truthyBlocks[i] && truthyBlocks[i].type === 'else' && action === 'deleteNextElseBlock') {
      truthyBlocks[i].type = 'end'; // convert to END
      // truthyBlocks[i] = undefined;
      // action = 'deleteNextEndBlock';
      action = '';

    } else if (truthyBlocks[i] && truthyBlocks[i].type === 'end' && action === 'deleteNextEndBlock') {
      truthyBlocks[i] = undefined;
      action = '';
    }

    i += 1;
  }

  return truthyBlocks;
}

function commentCodeInsideBlocks(sourceByLine, blocks) {
  let currentBlock;
  let i = 0;
  let action = '';
  let sourceByLineTransformed = sourceByLine.slice();

  while (i < sourceByLine.length) {
    currentBlock = blocks[i];

    if (currentBlock && (currentBlock.type === 'begin' || currentBlock.type === 'else')) {
      if (deleteFilteredBlocks) sourceByLineTransformed[i] = LINE_REMOVE;
      action = deleteFilteredBlocks ? 'deleteLine' : 'commentLine';
      i += 1;
      continue;
    }

    if (currentBlock && currentBlock.type === 'end') {
      if (deleteFilteredBlocks) sourceByLineTransformed[i] = LINE_REMOVE;
      action = '';
      i += 1;
      continue;
    }

    if (action === 'commentLine') {
      sourceByLineTransformed[i] = commentLine(sourceByLine[i]);
    } else if (action === 'deleteLine') {
      sourceByLineTransformed[i] = LINE_REMOVE;
    }

    i += 1;
  }

  return sourceByLineTransformed.filter((l) => {
    return l !== LINE_REMOVE;
  });
}

function commentLine(line) {
  return `// ${line}`;
}

function processPragmaOpts(inOpts) {
  var outOpts = {};
  if (inOpts[OPTKEY_USEENV]) {
    var env_str = inOpts[OPTKEY_USEENV];
    if (env_str === '*') {
      for (var k in process.env) outOpts[k] = process.env[k];
    } else {
      var env_keys = env_str.split(/\,\s*/);
      for (var k of env_keys) {
        if (process.env[k] !== undefined) outOpts[k] = process.env[k];
      }
    }
    delete inOpts[OPTKEY_USEENV];
  }

  if (inOpts[OPTKEY_DELETE]) {
    deleteFilteredBlocks = true;
    delete inOpts[OPTKEY_DELETE];
  }

  for (var k in inOpts) outOpts[k] = inOpts[k];
  return outOpts;
}

module.exports = function (source) {
  try {
    const sourceByLine = source.split(os.EOL);
    const blocks = searchBlocks(sourceByLine);
    const pragmaOpts = processPragmaOpts(loaderUtils.getOptions(this));
    const truthyBlocks = getTruthyBlocks(blocks, pragmaOpts);
    const transformedSource = commentCodeInsideBlocks(sourceByLine, truthyBlocks);

    return transformedSource.join(os.EOL);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

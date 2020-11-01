const PIPES = {
  $filter: require('./filter').pipe,
  $group: require('./group').pipe,
  $limit: require('./limit').pipe,
  $offset: require('./offset').pipe,
  $rebase: require('./rebase').pipe,
  $rebaseAndUnwindRelation: require('./rebase_and_unwind_relation').pipe,
  $unwind: require('./unwind').pipe,
}

function pipe(pipes, stream) {
  for (const [pipeKey, pipeVal] of Object.entries(pipes)) {
    if (pipeKey in PIPES) {
      stream = PIPES[pipeKey](...(Array.isArray(pipeVal) ? pipeVal : [pipeVal]), stream);
    } else {
      throw new Error(`Unknown pipe "${pipeKey}"`);
    }
  }

  return stream;
}

module.exports = {
  pipe,
};

'use strict';

var uuid = require('uuid');
var fs = require('fs');

var config = require('./config');

var people = config.people;
var blacklist = config.blacklist;
var baseUrl = config.baseUrl;

var graph = [];

var DB_PATH = __dirname + '/app/scripts/db.js';
var MAX_RETRIES = 100;
var MARK_VAL = 'x';

/**
 * symetrical blacklist.
 * if buri -> cede is blacklisted then cede -> buri is too.
 */
function blacklisted(from, to) {
  return (blacklist[from] && blacklist[from].indexOf(to) >= 0) || (blacklist[to] && blacklist[to].indexOf(from) >= 0);
}

/*
 * prepare 2-dim array. respecting blacklist
 */

function init() {

  graph = [];

  function row(from, fromIdx) {
    var result = [];
    people.forEach(function (to, toIdx) {
      if (fromIdx === toIdx || blacklisted(from, to)) {
        result.push(0);
      } else {
        result.push(1);
      }
    });
    return result;
  }

  people.forEach(function (from, idx) {
    graph.push(row(from, idx));
  });
}


function findCandidates() {
  var result = [];
  graph.forEach(function (from, fromIdx) {
    from.forEach(function (to, toIdx) {
      if (to === 1) {
        result.push({from: fromIdx, to: toIdx});
      }
    });
  });
  return result;
}

function mark(candidate) {
  graph[candidate.from].forEach(function(to, idx) {
    graph[candidate.from][idx] = 0;
    graph[idx][candidate.to] = 0;
  });
  graph[candidate.from][candidate.to] = MARK_VAL;
}

function pick() {
  var candidates = findCandidates();
  if (!candidates.length) {
    return false;
  }
  mark(candidates[Math.floor(Math.random() * candidates.length)]);
  return true;
}

function done() {
  return graph.every(function (from) {
    return from.indexOf(MARK_VAL) >= 0;
  });
}



/*
 * debug
 */

function printGraph() {
  for (var i=0; i < graph.length; i++) {
    for(var j=0; j < graph.length; j++) {
      process.stdout.write(graph[i][j] + ' ');
    }
    process.stdout.write('\n');
  }
}

function saveSolution() {

  console.log('solution is printed only once. make sure to remember urls');

  var db = {from: {}, to: {}};
  people.forEach(function (name) {
    ['from', 'to'].forEach(function (ctx) {
      var id = uuid();
      db[ctx][name] = id;
      db[ctx][id] = name;
    });
  });

  graph.forEach(function (from, idx) {
    console.log(people[idx] + '\t: ' + baseUrl + '#' + db.from[people[idx]] + '/' + db.to[people[from.indexOf(MARK_VAL)]]);
  });

  function values(obj) {
    var result = '{';
    for(var key in obj) {
      result += '\'' + key + '\':\'' + obj[key] + '\',';
    }
    result += '}';
    return result;
  }

  var data = 'window.db = { from: ' + values(db.from) + ', to: ' + values(db.to) + '};';

  fs.writeFileSync(DB_PATH, data);

}

function solve() {

  var solved = false;
  var abort = false;
  var i = 0;

  while(!solved && i++ < MAX_RETRIES) {
    init();
    abort = false;
    while(!done() && !abort) {
      if (!pick()){
        abort = true;
      }
    }
    if (!abort) {
      solved = true;
    }
  }

  console.log('---------- wichteln --------');

  if (solved) {
    console.log('Found solution after ' + (i - 1) + ' retries');
    saveSolution();
  } else {
    console.log('could not solve ;-(');
  }

  console.log('---------- wichteln --------');

}

module.exports = solve;

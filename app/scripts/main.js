(function (global) {
  'use strict';

  if (!global.db) {
    throw new Error('missing db!');
  }

  var d = global.document;
  var ids = global.location.hash.slice(1).split('/');
  var from = global.db.from[ids[0]];
  var to = global.db.to[ids[1]];
  var button = global.document.getElementById('button');

  function replace(id, html) {
    var e = d.getElementById(id);
    if (e) {
      e.innerHTML = html;
    }
  }

  replace('from',from);

  button.addEventListener('click', function(e){
    e.preventDefault();
    replace('to', to);
  }, false);

})(this);

(function (w) {
  'use strict';

  if (!w.db) {
    throw new Error('missing db!');
  }

  var d = w.document;
  var ids = w.location.hash.slice(1).split('/');
  var from = w.db[ids[0]];
  var to = w.db[ids[1]];
  var button = w.document.getElementById('button');

  function replace(id, html) {
    var e = d.getElementById(id);
    if (e) {
      e.innerHTML = html;
    }
  }

  replace('from','Aloa ' + from);

  button.addEventListener('click', function(e){
    e.preventDefault();
    replace('to', to);
  }, false);

})(this);
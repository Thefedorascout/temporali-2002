// Shared helpers for classic scripts; preserves direct file:// startup without a dev server.
(function(global){
  const utils = {
    $: id => document.getElementById(id),
    clamp: (v,a,b) => Math.max(a,Math.min(b,v)),
    lerp: (a,b,t) => a+(b-a)*t,
    rand: (a,b) => a+Math.random()*(b-a),
    choose: a => a[Math.floor(Math.random()*a.length)],
    dist: (x1,z1,x2,z2) => Math.hypot(x1-x2,z1-z2),
    fmt: n => n.toLocaleString('it-IT',{maximumFractionDigits:0}),
    euros: n => '€ '+n.toLocaleString('it-IT',{minimumFractionDigits:2,maximumFractionDigits:2})
  };
  global.TemporaliUtils = Object.freeze(utils);
})(window);

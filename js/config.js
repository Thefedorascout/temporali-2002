// Central settings used by game systems.
(function(global){
  global.TemporaliConfig = Object.freeze({
    version: '0.4.0',
    simulationRate: 12,
    initialCash: 120,
    startingBatteryPercent: 84,
    world: Object.freeze({ mapTitle: 'Provincia di Brescia & Mantova', minPopulation: 5000 })
  });
})(window);

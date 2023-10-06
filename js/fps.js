const fps = newElm('div', 'fps', body);
let startTime = performance.now();
let frame = 0;

function tick() {
  var time = performance.now();
  frame++;
  if (time - startTime > 1000) {
      fps.innerHTML = (frame / ((time - startTime) / 1000)).toFixed(1) + ' fps';
      startTime = time;
      frame = 0;
	}
  window.requestAnimationFrame(tick);
}
tick();
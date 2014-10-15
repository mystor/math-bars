function shallowCopy(ast) {
  var newObj = {};
  Object.keys(ast).forEach(function(k) {
    newObj[k] = ast[k];
  });
  return newObj;
}

// Evaluate the expression
// {
//   fn: function(...) {...},
//   args: [{...}, ...],
//   val: null,
//   loc: {start, end}
// }
function evaluate(ast) {
  var evaled = shallowCopy(ast);
  var min = Infinity;
  var max = -Infinity;
  evaled.args = evaled.args.map(evaluate);
  evaled.args.forEach(function(arg) {
    if (arg.min < min) {
      min = arg.min;
    }
    if (arg.max > max) {
      max = arg.max;
    }
  });
  evaled.val = evaled.fn.apply(null, evaled.args.map(function(arg) { return arg.val; }));
  if (evaled.val < min) {
    min = evaled.val;
  }
  if (evaled.val > max) {
    max = evaled.val;
  }

  evaled.max = max;
  evaled.min = min;

  return evaled;
}

var charWidth = 16;
var fullHeight = 50;
var colors = [
  'rgba(255, 0, 0, 0.5)',
  'rgba(0, 255, 0, 0.5)',
  'rgba(0, 0, 255, 0.5)'
];
// Generate the bars
// {
//   fn: function(...) {...},
//   args: [{...}, ...],
//   val: num,
//   loc: {start, end}
// }
function drawBars(ctx, evaled, i, state) {
  ctx.fillStyle = colors[i];
  var logVal = Math.log10(Math.abs(evaled.val) + 1);
  ctx.fillRect(
    evaled.loc.start * charWidth + i + 2,
    Math.min((-Math.sign(evaled.val) * logVal * state.scale) + fullHeight/2, fullHeight/2),
    (evaled.loc.end - evaled.loc.start) * charWidth - 2*i,
    Math.abs(logVal) * state.scale | 0
  );

  evaled.args.forEach(function(arg) {
    drawBars(ctx, arg, i+1, state);
  });
}

function drawAllBars(canvas, evaled) {
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  var state = {
    scale: (fullHeight/2)/Math.log10(100)
  };
  console.log(state);
  var i = 0;

  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(
    0,
    fullHeight/2 - 1,
    (evaled.loc.end - evaled.loc.start) * charWidth + 4,
    1
  );

  drawBars(ctx, evaled, i, state);
}

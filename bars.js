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

var charWidth = 8;
var fullHeight = 30;
var colors = ['#ff0000', '#00ff00', '#0000ff'];
// Generate the bars
// {
//   fn: function(...) {...},
//   args: [{...}, ...],
//   val: num,
//   loc: {start, end}
// }
function drawBars(ctx, evaled, i, state) {
  ctx.fillStyle = colors[i];
  ctx.fillRect(
    evaled.loc.start * charWidth + i + 2,
    Math.min((-evaled.val + state.offset) * state.scale, state.offset * state.scale),
    (evaled.loc.end - evaled.loc.start) * charWidth - 2*i,
    Math.abs(evaled.val) * state.scale
  );

  evaled.args.forEach(function(arg) {
    drawBars(ctx, arg, i+1, state);
  });
}

function drawAllBars(canvas, evaled) {
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  var offset = Math.max(Math.abs(evaled.min), Math.abs(evaled.max));
  var state = {
    offset: offset,
    scale: fullHeight/(2*offset)
  };
  var i = 0;
  drawBars(ctx, evaled, i, state);

  ctx.fillStyle = '#000000';
  ctx.fillRect(
    0,
    state.offset * state.scale - 1,
    (evaled.loc.end - evaled.loc.start) * charWidth + 4,
    2
  );
}

function TickerControl(callback) {
  var max = -1, val = -1;

  var controlDiv = document.createElement('div');
  controlDiv.style.padding = '5px';

  // Set CSS for the control border.
  var controlUI = document.createElement('div');
  $(controlUI).css({'direction': 'ltr', 'overflow': 'hidden', 'text-align': 'right', 'position': 'relative', 'color': 'rgb(86, 86, 86)', 'font-family': 'Roboto,Arial,sans-serif', '-moz-user-select': 'none', 'font-size': '11px', 'background-color': 'rgb(255, 255, 255)', 'padding': '2px', 'border-radius': '2px', 'background-clip': 'padding-box', 'border-width': '1px', 'border-style': 'solid', 'border-color': 'rgba(0, 0, 0, 0.15)', 'box-shadow': '0px 1px 4px -1px rgba(0, 0, 0, 0.3)'});
  controlDiv.appendChild(controlUI);
  
  var text = document.createTextNode(' ?/? ');

  var left = document.createElement('button');
  var right = document.createElement('button');
  left.innerHTML = '&lt;';
  right.innerHTML = '&gt;';
  left.style.padding       = right.style.padding       = '0px';
  left.style.width         = right.style.width         = '16px';
  left.style.height        = right.style.height        = '16px';
  left.style.fontSize      = right.style.fontSize      = '7pt';
  left.style.verticalAlign = right.style.verticalAlign = 'middle';
  left.disabled            = right.disabled            = true;
  google.maps.event.addDomListener(left, 'click', function ()
  {
    if (val > 1)
      --val;
    if (val == 1)
      left.disabled = true;
    right.disabled = false;
    text.textContent = ' ' + val + '/' + max + ' ';
    callback(val);
  });
  google.maps.event.addDomListener(right, 'click', function ()
  {
    if (val < max)
      ++val;
    if (val == max)
      right.disabled = true;
    left.disabled = false;
    text.textContent = ' ' + val + '/' + max + ' ';
    callback(val);
  });

  controlUI.appendChild(left);
  controlUI.appendChild(text);
  controlUI.appendChild(right);

  this.getDiv = function ()
  {
    return controlDiv;
  }

  this.disable = function ()
  {
    left.disabled = true;
    right.disabled = true;
    text.textContent = ' ?/? ';
    max = -1;
    val = -1;
  }

  this.setSize = function (_max)
  {
    left.disabled = true;
    right.disabled = (_max == 1);
    text.textContent = ' 1/' + _max + ' ';
    max = _max;
    val = 1;
  }
}


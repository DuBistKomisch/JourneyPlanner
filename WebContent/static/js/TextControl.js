function TextControl(text) {
  var controlDiv = document.createElement('div');
  controlDiv.style.padding = '5px';

  // Set CSS for the control border.
  var controlUI = document.createElement('div');
  $(controlUI).css({'direction': 'ltr', 'overflow': 'hidden', 'text-align': 'right', 'position': 'relative', 'color': 'rgb(86, 86, 86)', 'font-family': 'Roboto,Arial,sans-serif', '-moz-user-select': 'none', 'font-size': '11px', 'background-color': 'rgb(255, 255, 255)', 'padding': '1px 4px', 'border-radius': '2px', 'background-clip': 'padding-box', 'border-width': '1px', 'border-style': 'solid', 'border-color': 'rgba(0, 0, 0, 0.15)', 'box-shadow': '0px 1px 4px -1px rgba(0, 0, 0, 0.3)'});
  controlUI.innerHTML = text;
  controlDiv.appendChild(controlUI);

  this.getDiv = function ()
  {
    return controlDiv;
  }

  this.setText = function (text)
  {
    controlUI.innerHTML = text;
  }
}


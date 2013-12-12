// rendering
var map;
var l_stops = [], l_links = [], l_paths = [];
var v_stops = true, v_links = true;
var icon = { path : google.maps.SymbolPath.CIRCLE, scale : 2 };
var arrow = { path : google.maps.SymbolPath.FORWARD_OPEN_ARROW, scale : 2 };
var colors = [ { strokeColor : '#40B040' }, { strokeColor : '#0040F0' },
    { strokeColor : '#F04000' }, { strokeColor : '#8040C0' },
    { strokeColor : '#40C0A0' } ];

// planning
var ticker;
var from, to;

function log(text)
{
  java('log', text);

  // thanks IE
  if (typeof (console) != "undefined")
    console.log(text);
}

function initialize()
{
  // stop errors
  if (typeof (java) == "undefined")
    java = function(a, b)
    {
    };

  var mapOptions = {
    // basic
    center : new google.maps.LatLng(-37.8, 144.95),
    zoom : 11,
    // controls
    panControl : false,
    streetViewControl : false,
    mapTypeControl : true,
    // controls options
    zoomControlOptions : { style : google.maps.ZoomControlStyle.SMALL,
      position : google.maps.ControlPosition.LEFT_TOP },
    mapTypeControlOptions : {
      style : google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
      position : google.maps.ControlPosition.TOP_LEFT } };

  // create map
  map = new google.maps.Map($('#map-canvas')[0], mapOptions);

  // search controls
  ticker = new TickerControl(showPath);
  map.controls[google.maps.ControlPosition.RIGHT_TOP].push(ticker.getDiv());

  // layer controls
  cb1 = new CheckboxControl('Stops', true, function(v)
  {
    setLayer(l_stops, v_stops = v);
  });
  cb2 = new CheckboxControl('Links', true, function(v)
  {
    setLayer(l_links, v_links = v);
  });
  map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(cb2.getDiv());
  map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(cb1.getDiv());

  // AJAX time
  $.getJSON('api/stations', function(data)
  {
    console.log(data);
  });
}

// api

function js_stop_clear()
{
  while (l_stops.length)
  {
    l_stops[0].setMap(null);
    l_stops.shift();
  }
}

function js_stop_add(id, name, lat, lng)
{
  var marker = new google.maps.Marker({
    position : new google.maps.LatLng(lat, lng), map : v_stops ? map : null,
    title : name + ' (' + id + ')', icon : icon, zIndex : 5 });
  marker.id = id;
  google.maps.event.addListener(marker, 'click', function()
  {
    java('select', id);
  });
  l_stops.push(marker);
}

function js_link_clear()
{
  while (l_links.length)
  {
    l_links[0].setMap(null);
    l_links.shift();
  }
}

function js_link_add(from, to)
{
  l_links.push(new google.maps.Polyline(
      { path : [ getStop(from).position, getStop(to).position ],
        map : v_links ? map : null, strokeColor : '#ff0000',
        strokeOpacity : 0.3, strokeWeight : 2,
        icons : [ { icon : arrow, offset : '100%' } ], zIndex : 2 }));
}

function js_path_clear()
{
  while (l_paths.length)
  {
    l_paths[0].setMap(null);
    l_paths.shift();
  }
  ticker.disable();
}

function js_path_add(stack)
{
  var pos = [];
  for (var k = 0; k < stack.length; k++)
    pos.push(getStop(stack[k]).position);
  l_paths.push(new google.maps.Polyline(
      { path : pos, map : map, strokeColor : '#40a040', strokeOpacity : 0.75,
        strokeWeight : 4, zIndex : 4,
        icons : [ { icon : arrow, offset : '100%' } ], visible : false }));
}

function js_show_one()
{
  setLayer(l_paths, false);
  for (var i = 0; i < l_paths.length; i++)
    l_paths[i].setOptions(colors[0]);
  ticker.setSize(l_paths.length);
  showPath(1);
}

function js_show_top(n)
{
  setLayer(l_paths, false);
  var bounds = getBounds(l_paths[0]);
  for (var i = 0; i < n && i < l_paths.length; i++)
  {
    l_paths[i].setOptions(colors[i % colors.length]);
    l_paths[i].setVisible(true);
    bounds = bounds.union(getBounds(l_paths[i]));
  }
  map.fitBounds(bounds);
  ticker.disable();
}

// util

function getStop(id)
{
  for (var i = 0; i < l_stops.length; i++)
    if (l_stops[i].id == id)
      return l_stops[i];
}

function showPath(n)
{
  setLayer(l_paths, false);
  l_paths[n - 1].setVisible(true);
  map.fitBounds(getBounds(l_paths[n - 1]));
}

function getBounds(line)
{
  var path = line.getPath().getArray();
  var lat_lo = 9999, lat_hi = -9999;
  var lng_lo = 9999, lng_hi = -9999;
  for (var i = 0; i < path.length; i++)
  {
    if (path[i].lat() < lat_lo)
      lat_lo = path[i].lat();
    if (path[i].lat() > lat_hi)
      lat_hi = path[i].lat();
    if (path[i].lng() < lng_lo)
      lng_lo = path[i].lng();
    if (path[i].lng() > lng_hi)
      lng_hi = path[i].lng();
  }

  return new google.maps.LatLngBounds(new google.maps.LatLng(lat_lo, lng_lo),
      new google.maps.LatLng(lat_hi, lng_hi));
}

function setLayer(layer, show)
{
  for (var i = 0; i < layer.length; i++)
    layer[i].setVisible(show);
}

// init
$(document).ready(initialize);

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
var from = -1, to = -1;

// init
function initialize()
{
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

  // side controls
  $('#spin').spinner({ min : 2, max : 5 });
  $('button').button();
  $('#search').click(search);
  $('#from').autocomplete(
      { delay : 0, source : api_stop_search, select : function(event, ui)
      {
        event.preventDefault();
        $('#from').val(ui.item.label);
        $('#from').addClass('valid');
        from = ui.item.value;
      }, search : function(event, ui)
      {
        $('#from').removeClass('valid');
        from = -1;
      }, change : function(event, ui)
      {
        if (ui.item = null)
        {
          $('#from').removeClass('valid');
          from = -1;
        }
      }, focus : function(event, ui)
      {
        event.preventDefault();
      } });
  $('#to').autocomplete(
      { delay : 0, source : api_stop_search, select : function(event, ui)
      {
        event.preventDefault();
        $('#to').val(ui.item.label);
        $('#to').addClass('valid');
        to = ui.item.value;
      }, search : function(event, ui)
      {
        $('#to').removeClass('valid');
        to = -1;
      }, change : function(event, ui)
      {
        if (ui.item = null)
        {
          $('#to').removeClass('valid');
          to = -1;
        }
      }, focus : function(event, ui)
      {
        event.preventDefault();
      } });

  // AJAX time
  getJSON('api/stops', {}, process_stops, 'Couldn\t load stops.', 10);
}

$(document).ready(initialize);

// callbacks

function process_stops(data)
{
  $.each(data, function(key, item)
  {
    api_stop_add(item.id, item.name, item.lat, item.lng);
  });

  getJSON('api/links', {}, process_links, 'Couldn\t load links.', 10);
}

function process_links(data)
{
  $.each(data, function(key, item)
  {
    api_link_add(item.from, item.to);
  });
}

function search()
{
  if (from == -1)
  {
    $('#from').focus();
    return;
  }
  if (to == -1)
  {
    $('#to').focus();
    return;
  }

  $('#search').button("option", "disabled", true);
  getJSON('api/search', { from : from, to : to }, process_results,
      'Couldn\t load results.', 10).done(function(a, b, c)
  {
    $('#from, #to, #search').each(function(item)
    {
      $('#search').button("option", "disabled", false);
    });
  });
}

function process_results(data)
{
  api_path_clear();
  $.each(data, function(key, item)
  {
    api_path_add(item.stops);
  });
  if (data.length == 0)
    api_status('No results found.', false);
  else if ($('#compare').prop('checked'))
    api_show_top($('#spin').spinner('value'));
  else
    api_show_one();
}

// api

function api_log(text)
{
  // thanks IE
  if (typeof (console) != 'undefined')
    console.log(text);
}

function api_status(text, error)
{
  $('#status').removeClass('ui-state-error ui-state-highlight');
  $('#status').addClass(error ? 'ui-state-error' : 'ui-state-highlight');
  if (typeof (text) == 'undefined')
  {
    $('#status').text('');
    $('#status').hide();
  }
  else
  {
    $('#status').text(text);
    $('#status').show();
  }
}

function api_select(id, name)
{
  if (from != -1 && to != -1)
  {
    $('#from, #to').val('');
    $('#from, #to').removeClass('valid');
    from = to = -1;
  }

  if (from == -1)
  {
    $('#from').val(name);
    $('#from').addClass('valid');
    from = id;
  }
  else if (to == -1)
  {
    $('#to').val(name);
    $('#to').addClass('valid');
    to = id;
  }
}

function api_stop_clear()
{
  while (l_stops.length)
  {
    l_stops[0].setMap(null);
    l_stops.shift();
  }
}

function api_stop_add(id, name, lat, lng)
{
  var marker = new google.maps.Marker({
    position : new google.maps.LatLng(lat, lng), map : v_stops ? map : null,
    title : name + ' (' + id + ')', icon : icon, zIndex : 5 });
  marker.id = id;
  marker.name = name;
  google.maps.event.addListener(marker, 'click', function()
  {
    api_select(id, name);
  });
  l_stops.push(marker);
}

function api_stop_search(part, cb)
{
  var needle = part.term.toLowerCase();
  var l_results = [];
  for (var i = 0; i < l_stops.length; i++)
    if (l_stops[i].name.toLowerCase().indexOf(needle) > -1)
    {
      l_results.push({ label : l_stops[i].name, value : l_stops[i].id });
      if (l_results.length == 10)
        break;
    }
  cb(l_results);
}

function api_link_clear()
{
  while (l_links.length)
  {
    l_links[0].setMap(null);
    l_links.shift();
  }
}

function api_link_add(from, to)
{
  l_links.push(new google.maps.Polyline(
      { path : [ getStop(from).position, getStop(to).position ],
        map : v_links ? map : null, strokeColor : '#ff0000',
        strokeOpacity : 0.3, strokeWeight : 2,
        icons : [ { icon : arrow, offset : '100%' } ], zIndex : 2 }));
}

function api_path_clear()
{
  while (l_paths.length)
  {
    l_paths[0].setMap(null);
    l_paths.shift();
  }
  ticker.disable();
}

function api_path_add(stack)
{
  var pos = [];
  for (var k = 0; k < stack.length; k++)
    pos.push(getStop(stack[k]).position);
  l_paths.push(new google.maps.Polyline(
      { path : pos, map : map, strokeColor : '#40a040', strokeOpacity : 0.75,
        strokeWeight : 4, zIndex : 4,
        icons : [ { icon : arrow, offset : '100%' } ], visible : false }));
}

function api_show_one()
{
  setLayer(l_paths, false);
  for (var i = 0; i < l_paths.length; i++)
    l_paths[i].setOptions(colors[0]);
  ticker.setSize(l_paths.length);
  showPath(1);
}

function api_show_top(n)
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

function getJSON(url, params, success, errorMessage, timeout)
{
  return $.ajax(
      { url : url, data : params, dataType : 'json', success : success,
        timeout : timeout * 1000 }).fail(function(a, b, c)
  {
    api_status(errorMessage, true);
  });
}

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

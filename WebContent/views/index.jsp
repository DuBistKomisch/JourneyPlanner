<%@ page language="java" contentType="text/html; charset=UTF-8"
  pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Journey Planner - Jake Barnes</title>
    <meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" type="text/css" href="<c:url value="/static/css/reset.css" />" />
    <link rel="stylesheet" type="text/css" href="<c:url value="/static/css/template.css" />" />
    <script src="http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js"></script>
    <script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDX4taVnGzTRopaLtDnFwCiXv7SSPMFWXs&amp;sensor=false&amp;region=AU"></script>
    <script type="text/javascript" src="<c:url value="/static/js/TextControl.js" />"></script>
    <script type="text/javascript" src="<c:url value="/static/js/CheckboxControl.js" />"></script>
    <script type="text/javascript" src="<c:url value="/static/js/TickerControl.js" />"></script>
    <script type="text/javascript" src="<c:url value="/static/js/main.js" />"></script>
  </head>
  <body>
    <div id="map-canvas"></div>
  </body>
</html>

package au.com.jakebarnes.JourneyPlanner;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.naming.InitialContext;
import javax.sql.DataSource;

import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/api")
public class API
{
  // JDBC
  private DataSource dataSource;

  // constants
  private static final int RESULTS_LIMIT = 3;
  /*
   * mode 1 : bus 2 : train 3 : tram
   */
  // get stops
  private static final String s1 = "SELECT MetlinkStopID, StopSpecName, GPSLat, GPSLong, StopModeID "
      + "FROM tblstopinformation "
      + "WHERE StopModeID = 2 OR StopModeID = 3 "
      + "ORDER BY StopModeID";
  // get which stops you can get to directly from each stop
  private static final String s2 = "SELECT DISTINCT a.MetlinkStopID AS 'from', b.MetlinkStopID AS 'to' "
      + "FROM tblstoproutes AS b "
      + "JOIN ("
      + "SELECT MetlinkStopID, RouteID, StopOrder "
      + "FROM tblstoproutes "
      + "NATURAL JOIN tblstopinformation "
      + "WHERE StopModeID = 2 OR StopModeID = 3"
      + ") AS a ON a.RouteID = b.RouteID "
      + "JOIN tblstopinformation AS c ON b.metlinkStopID = c.MetlinkStopID "
      + "WHERE b.StopOrder = a.StopOrder+1 AND (c.StopModeID = 2 OR StopModeID=3)";

  // data
  private Map<Integer, List<Integer>> links;

  public API() throws Exception
  {
    // JDBC
    dataSource = (DataSource) new InitialContext()
        .lookup("java:/comp/env/jdbc/ptvdb");

    // data
    try (Connection conn = dataSource.getConnection();
        Statement stat = conn.createStatement();)
    {
      links = new HashMap<Integer, List<Integer>>();
      ResultSet rs = stat.executeQuery(s1);
      while (rs.next())
      {
        links.put(rs.getInt(1), new ArrayList<Integer>());
      }
      rs.close();
      rs = stat.executeQuery(s2);
      while (rs.next())
      {
        links.get(rs.getInt(1)).add(rs.getInt(2));
      }
      rs.close();
    }
  }

  @RequestMapping(value = "/stops", method = RequestMethod.GET)
  @ResponseBody
  public ArrayList<Stop> getStops(ModelMap model) throws Exception
  {
    ArrayList<Stop> result = new ArrayList<Stop>();

    try (Connection conn = dataSource.getConnection();
        Statement stat = conn.createStatement();
        ResultSet rs = stat.executeQuery(s1))
    {
      while (rs.next())
        result.add(new Stop(rs.getInt(1), rs.getString(2), rs.getDouble(3), rs
            .getDouble(4), rs.getInt(5)));
    }

    return result;
  }

  @RequestMapping(value = "/links", method = RequestMethod.GET)
  @ResponseBody
  public ArrayList<Link> getLinks(ModelMap model) throws Exception
  {
    ArrayList<Link> result = new ArrayList<Link>();

    for (Map.Entry<Integer, List<Integer>> entry : links.entrySet())
      for (Integer to : entry.getValue())
        result.add(new Link(entry.getKey(), to));

    return result;
  }

  @RequestMapping(value = "/search", method = RequestMethod.GET)
  @ResponseBody
  public List<Path> search(@RequestParam int from, @RequestParam int to,
      @RequestParam(defaultValue = "0") int offset, ModelMap model)
      throws Exception
  {
    List<Path> paths = new ArrayList<Path>();

    Deque<Integer> stack = new ArrayDeque<Integer>();
    Map<Integer, Boolean> marked = new HashMap<Integer, Boolean>();
    stack.push(from);
    marked.put(from, true);
    dfs(paths, stack, marked, to);

    return paths.subList(offset, offset + API.RESULTS_LIMIT);
  }

  private void dfs(List<Path> paths, Deque<Integer> stack,
      Map<Integer, Boolean> marked, int to)
  {
    List<Integer> l = links.get(stack.peek());
    if (l == null)
      return;

    for (int i = 0; i < l.size(); i++)
    {
      int node = l.get(i);

      // skip
      if (marked.containsKey(node) && marked.get(node))
        continue;

      // found
      if (node == to)
      {
        Path path = new Path();
        for (Iterator<Integer> j = stack.descendingIterator(); j.hasNext();)
          path.addStop(j.next());
        path.addStop(to);
        paths.add(path);
      }

      // step in
      marked.put(node, true);
      stack.push(node);
      dfs(paths, stack, marked, to);
      stack.pop();
      marked.put(node, false);
    }
  }

  public class Stop
  {
    private int id;
    private String name;
    private double lat;
    private double lng;
    private int mode;

    public int getId()
    {
      return id;
    }

    public double getLat()
    {
      return lat;
    }

    public double getLng()
    {
      return lng;
    }

    public String getName()
    {
      return name;
    }

    public int getMode()
    {
      return mode;
    }

    public Stop(int id, String name, double lat, double lng, int mode)
    {
      this.id = id;
      this.name = name;
      this.lat = lat;
      this.lng = lng;
      this.mode = mode;
    }
  }

  public class Link
  {
    private int from;
    private int to;

    public int getFrom()
    {
      return from;
    }

    public int getTo()
    {
      return to;
    }

    public Link(int from, int to)
    {
      this.from = from;
      this.to = to;
    }
  }

  public class Path
  {
    private ArrayList<Integer> stops;

    public ArrayList<Integer> getStops()
    {
      return stops;
    }

    public void addStop(int id)
    {
      stops.add(id);
    }

    public Path()
    {
      stops = new ArrayList<Integer>();
    }
  }
}

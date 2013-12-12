package au.com.jakebarnes.JourneyPlanner;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/api")
public class API
{
  // JDBC
  private Connection conn;
  private PreparedStatement s1, s2;

  // data
  private Map<Integer, ArrayList<Integer>> links;

  public API() throws Exception
  {
    final int mode = 2;

    // JDBC
    Class.forName("com.mysql.jdbc.Driver");
    conn = DriverManager.getConnection("jdbc:mysql://localhost/ptv", "jp",
        "abc123");
    s1 = conn
        .prepareStatement("SELECT MetlinkStopID, StopSpecName, GPSLat, GPSLong FROM tblstopinformation WHERE StopModeID = ?");
    s1.setInt(1, mode);
    s2 = conn
        .prepareStatement("SELECT DISTINCT a.MetlinkStopID AS 'from', b.MetlinkStopID AS 'to' FROM tblstoproutes AS b JOIN (SELECT MetlinkStopID, RouteID, StopOrder FROM tblstoproutes NATURAL JOIN tblstopinformation WHERE StopModeID = ?) AS a ON a.RouteID = b.RouteID JOIN tblstopinformation AS c ON b.metlinkStopID = c.MetlinkStopID WHERE b.StopOrder = a.StopOrder+1 AND c.StopModeID = ?");
    s2.setInt(1, mode);
    s2.setInt(2, mode);

    // data
    links = new HashMap<Integer, ArrayList<Integer>>();
    ResultSet rs = s1.executeQuery();
    while (rs.next())
    {
      links.put(rs.getInt(1), new ArrayList<Integer>());
    }
    rs.close();
    rs = s2.executeQuery();
    while (rs.next())
    {
      links.get(rs.getInt(1)).add(rs.getInt(2));
    }
  }

  @RequestMapping(value = "/stations", method = RequestMethod.GET)
  @ResponseBody
  public ArrayList<Station> getStations(ModelMap model) throws Exception
  {
    ArrayList<Station> stations = new ArrayList<Station>();

    ResultSet rs = s1.executeQuery();
    while (rs.next())
    {
      stations.add(new Station(rs.getInt(1), rs.getString(2), rs.getDouble(3),
          rs.getDouble(4)));
    }

    return stations;
  }

  @RequestMapping(value = "/links", method = RequestMethod.GET)
  @ResponseBody
  public ArrayList<Link> getLinks(ModelMap model) throws Exception
  {
    ArrayList<Link> links = new ArrayList<Link>();

    ResultSet rs = s2.executeQuery();
    while (rs.next())
    {
      links.add(new Link(rs.getInt(1), rs.getInt(2)));
    }

    return links;
  }

  public class Station
  {
    private int id;
    private String name;
    private double lat;
    private double lng;

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

    public Station(int id, String name, double lat, double lng)
    {
      this.id = id;
      this.name = name;
      this.lat = lat;
      this.lng = lng;
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
}

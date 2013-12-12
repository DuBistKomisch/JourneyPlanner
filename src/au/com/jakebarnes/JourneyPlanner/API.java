package au.com.jakebarnes.JourneyPlanner;

import java.util.ArrayList;

import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/api")
public class API
{
  @RequestMapping(value = "/stations", method = RequestMethod.GET)
  @ResponseBody
  public ArrayList<Station> getStations(ModelMap model)
  {
    ArrayList<Station> stations = new ArrayList<Station>();
    stations.add(new Station("test"));
    return stations;
  }

  public class Station
  {
    private String name;

    public String getName()
    {
      return name;
    }

    public Station(String name)
    {
      this.name = name;
    }
  }
}

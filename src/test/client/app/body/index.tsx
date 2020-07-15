import React from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
} from 'react-router-dom'
import PieChart from './pieChart'
import Graph from './graph/graph'
import Candlestick from './graph/candlestick'
import DarkModeFlexDimensions from './graph/darkModeFlexDimensions'

export const render = () => (
  <Router>
    <div className="body-wrapper">
      <div className="body">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/pie-chart">Pie Chart</Link>
          </li>
          <li>
            <Link to="/graph">Graph</Link>
          </li>
          <li>
            <Link to="/graph-candlestick">Graph - Candlestick</Link>
          </li>
          <li>
            <Link to="/graph-dark-flex">Graph - Dark Mode w/ Flexible Dimensions</Link>
          </li>
        </ul>
        <Switch>
          <Route path="/" exact>
            <h1>Home</h1>
          </Route>
          <Route path="/pie-chart">
            <PieChart />
          </Route>
          <Route path="/graph">
            <Graph />
          </Route>
          <Route path="/graph-dark-flex">
            <DarkModeFlexDimensions />
          </Route>
          <Route path="/graph-candlestick">
            <Candlestick />
          </Route>
        </Switch>
      </div>
    </div>
  </Router>
)

export default render

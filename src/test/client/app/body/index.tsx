import React from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
} from 'react-router-dom'
import PieChart from './pieChart'
import Chart from './chart/chart'
import Candlestick from './chart/candlestick'
import DarkModeFlexDimensions from './chart/darkModeFlexDimensions'

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
            <Link to="/chart">Chart</Link>
          </li>
          <li>
            <Link to="/chart-candlestick">Chart - Candlestick</Link>
          </li>
          <li>
            <Link to="/chart-dark-flex">Chart - Dark Mode w/ Flexible Dimensions</Link>
          </li>
        </ul>
        <Switch>
          <Route path="/" exact>
            <h1>Home</h1>
          </Route>
          <Route path="/pie-chart">
            <PieChart />
          </Route>
          <Route path="/chart">
            <Chart />
          </Route>
          <Route path="/chart-dark-flex">
            <DarkModeFlexDimensions />
          </Route>
          <Route path="/chart-candlestick">
            <Candlestick />
          </Route>
        </Switch>
      </div>
    </div>
  </Router>
)

export default render

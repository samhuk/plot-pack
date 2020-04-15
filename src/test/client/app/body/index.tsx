import React from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
} from 'react-router-dom'
import Button from './button'
import FormExample from './formExample'
import MultipartTextInput from './multiPartTextInput'
import TextInput from './textInput'
import PieChart from './pieChart'
import Graph from './graph/graph'
import Candlestick from './graph/candlestick'

export const render = () => (
  <Router>
    <div className="body-wrapper">
      <div className="body">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/form-example">Form demo</Link>
          </li>
          <li>
            <Link to="/button">Buttons</Link>
          </li>
          <li>
            <Link to="/text-input">Text Input</Link>
          </li>
          <li>
            <Link to="/multipart-text-input">Multi-part Text Input</Link>
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
        </ul>
        <Switch>
          <Route path="/" exact>
            <h1>Home</h1>
          </Route>
          <Route path="/form-example">
            <FormExample />
          </Route>
          <Route path="/button">
            <Button />
          </Route>
          <Route path="/text-input">
            <TextInput />
          </Route>
          <Route path="/multipart-text-input">
            <MultipartTextInput />
          </Route>
          <Route path="/pie-chart">
            <PieChart />
          </Route>
          <Route path="/graph">
            <Graph />
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

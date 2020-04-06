import React, { useState } from 'react'
import PieChart from '../../../../app/components/pieChart'
import DataMode from '../../../../app/components/pieChart/types/DataMode'
import DataPoint from '../../../../app/components/pieChart/types/DataPoint'

export const render = () => {
  const [currentDataPoint, setCurrentDataPoint] = useState<DataPoint>(null)
  const [rent, setRent] = useState<string>('5')
  const [groceries, setGroceries] = useState<string>('14')
  const [utilityBills, setUtilityBills] = useState<string>('10')
  const [groceriesLabel, setGroceriesLabel] = useState<string>('Groceries')


  return (
    <div className="pie-chart">
      <h2>Pie Chart</h2>
      <div className="sandbox">
        Groceries Label:
        <input type="text" value={groceriesLabel} onChange={e => setGroceriesLabel(e.target.value)} />
        Utility Bills:
        <input type="number" value={utilityBills} onChange={e => setUtilityBills(e.target.value)} />
        Rent:
        <input type="number" value={rent} onChange={e => setRent(e.target.value)} />
        Groceries:
        <input type="number" value={groceries} onChange={e => setGroceries(e.target.value)} />
        <PieChart
          radiusPx={250}
          dataMode={DataMode.RAW}
          data={[
            { name: 'Rent', description: '1', value: parseFloat(rent) },
            { name: groceriesLabel, description: '2', value: parseFloat(groceries) },
            { name: 'Travel', description: '3', value: 15 },
            { name: 'Utilities and Billsssssssssssssssss', description: '4', value: parseFloat(utilityBills) },
          ]}
          onClick={setCurrentDataPoint}
        />
        {currentDataPoint !== null ? `You have selected: ${currentDataPoint.name}` : null}
      </div>
      <div className="sandbox">
        <PieChart
          radiusPx={200}
          dataMode={DataMode.RAW}
          data={[
            { name: 'Rent', description: '1', value: 600 },
            { name: 'Groceries', description: '2', value: 250 },
            { name: 'Travel', description: '3', value: 100 },
            { name: 'Utility Bills', description: '4', value: 60 },
          ]}
        />
      </div>
      <div className="sandbox">
        <PieChart
          radiusPx={100}
          dataMode={DataMode.PROPORTION}
          data={[
            { name: 'Rent', description: '1', value: 0.1 },
          ]}
        />
      </div>
      <div className="sandbox">
        Rent:
        <input type="number" value={rent} onChange={e => setRent(e.target.value)} />
        Groceries:
        <input type="number" value={groceries} onChange={e => setGroceries(e.target.value)} />
        Utility Bills:
        <input type="number" value={utilityBills} onChange={e => setUtilityBills(e.target.value)} />
        <PieChart
          radiusPx={300}
          dataMode={DataMode.RAW}
          textBoxDistanceFromCenter={0.8}
          data={[
            { name: 'Rent', description: '1', value: parseFloat(rent) },
            { name: 'Groceries', description: '1', value: parseFloat(groceries) },
            { name: 'Utility Bills', description: '1', value: parseFloat(utilityBills) },
            { name: 'Utility Bills', description: '1', value: parseFloat(utilityBills) },
            { name: 'Utility Bills', description: '1', value: parseFloat(utilityBills) },
            { name: 'Utility Bills', description: '1', value: parseFloat(utilityBills) },
            { name: 'Utility Bills', description: '1', value: parseFloat(utilityBills) },
            { name: 'Utility Bills', description: '1', value: parseFloat(utilityBills) },
            { name: 'Utility Bills', description: '1', value: parseFloat(utilityBills) },
            { name: 'Utility Bills', description: '1', value: parseFloat(utilityBills) },
            { name: 'Utility Bills', description: '1', value: parseFloat(utilityBills) },
            { name: 'Utility Bills', description: '1', value: parseFloat(utilityBills) },
          ]}
        />
      </div>
    </div>
  )
}

export default render

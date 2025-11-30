import React, { useState } from 'react';
import './App.css';

interface Position {
  collateral: string;
  debt: string;
  ltv: string;
  risk: string;
}

const API_BASE_URL = 'http://localhost:3001';

function App() {
  const [walletAddress, setWalletAddress] = useState('');
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWalletAddress(event.target.value);
  };

  const handleFetchPositions = async () => {
    if (!walletAddress) {
      setError('Please enter a wallet address.');
      return;
    }
    setLoading(true);
    setError(null);
    setPositions([]);

    try {
      const response = await fetch(`${API_BASE_URL}/api/positions/${walletAddress}`);
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to fetch data.');
      }
      const data = await response.json();
      console.log('Raw API response from backend:', data); // Add this line
      setPositions(data);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskClass = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low':
        return 'risk-low';
      case 'medium':
        return 'risk-medium';
      case 'high':
        return 'risk-high';
      case 'very high':
        return 'risk-very-high';
      default:
        return '';
    }
  };

  const renderTableContent = () => {
    if (loading) {
      return <tr><td colSpan={4}>Loading positions...</td></tr>;
    }
    if (error) {
      return <tr><td colSpan={4} className="error-message">{error}</td></tr>;
    }
    if (positions.length === 0) {
      return <tr><td colSpan={4}>No positions found for this wallet.</td></tr>;
    }
    return positions.map((position, index) => (
      <tr key={index}>
        <td>{position.collateral}</td>
        <td>{position.debt}</td>
        <td>{position.ltv}</td>
        <td>
          <span className={`risk-pill ${getRiskClass(position.risk)}`}>
            {position.risk}
          </span>
        </td>
      </tr>
    ));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Juplend Liquidation Risk Manager</h1>
        <p>Monitor your Solana DeFi positions to avoid liquidation.</p>
      </header>
      <main>
        <div className="input-section">
          <input
            type="text"
            value={walletAddress}
            onChange={handleAddressChange}
            placeholder="Enter your wallet address..."
            className="wallet-input"
          />
          <button onClick={handleFetchPositions} className="fetch-button" disabled={loading}>
            {loading ? 'Fetching...' : 'Fetch Positions'}
          </button>
        </div>
        <div className="positions-table">
          <h2>Your Positions</h2>
          <table>
            <thead>
              <tr>
                <th>Collateral</th>
                <th>Debt</th>
                <th>LTV</th>
                <th>Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {renderTableContent()}
            </tbody>
          </table>
        </div>
      </main>
      <footer className="App-footer">
        <p>Not financial advice. Use at your own risk.</p>
      </footer>
    </div>
  );
}

export default App;

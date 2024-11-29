import { Transaction } from '@mysten/sui/transactions';
import {
  ConnectButton,
  useCurrentAccount,
  useSignTransaction,
  useSuiClient,
} from '@mysten/dapp-kit';
import { useState } from 'react';

export default function App() {
  const { mutateAsync: signTransaction } = useSignTransaction();
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const [status, setStatus] = useState('');
  const [programs, setPrograms] = useState([]);
  const [packageId, setPackageId] = useState('0xc97a43743a86a32f8a44df73692c1fd9870e5e1b4b192a5c8becb176f7d2eace'); // State to store the package ID

  // Create Program function
  async function createProgram(title, description, goalAmount) {
    try {
      const tx = new Transaction();
      // Add Move call for creating a program
      tx.moveCall({
        target: `${packageId}::funding::create_program`, // Use dynamic package ID
        arguments: [
          tx.pure.string(title), // Pass title as vector<u8>
          tx.pure.string(description), // Pass description as vector<u8>
          tx.pure.u64(goalAmount),
        ],
      });

      // Sign the transaction with the connected wallet
      const { bytes, signature } = await signTransaction({
        transaction: tx,
        chain: 'sui:testnet',
      });

      console.log("HERE 1");

      // Execute the transaction
      const result = await client.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: { showEffects: true },
      });

      console.log('Program Created:', result);
      setStatus(`Program created successfully! Transaction ID: ${result.digest}`);
    } catch (error) {
      console.error('Error creating program:', error);
      setStatus('Failed to create program. Check the console for details.');
    }
  }

  // Fetch Programs function
  async function fetchPrograms() {
    try {
      if (!currentAccount) return;

      const objects = await client.getOwnedObjects({
        owner: currentAccount.address,
      });

      const programObjects = objects.data.filter(obj => obj.type === 'crowdsourcing::Program');

      const programsList = programObjects.map(obj => ({
        id: obj.objectId,
        details: obj.data,
      }));

      setPrograms(programsList);
      console.log('Fetched Programs:', programsList);
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  }

  // Donate to a Program
  async function donateToProgram(programId, amount) {
    try {
      const tx = new Transaction();

      // Move call to your module's `donate` function
      tx.moveCall({
        target: `${packageId}::crowdsourcing::donate`, // Use dynamic package ID
        arguments: [tx.object(programId), tx.pure(amount)],
      });

      // Sign the transaction with the connected wallet
      const { bytes, signature } = await signTransaction({
        transaction: tx,
        chain: 'sui:testnet',
      });

      // Execute the transaction on the blockchain
      const result = await client.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: { showEffects: true },
      });

      console.log('Donation Successful:', result);
      setStatus(`Donated successfully! Transaction ID: ${result.digest}`);
    } catch (error) {
      console.error('Error donating:', error);
      setStatus('Failed to donate. Check the console for details.');
    }
  }

  return (
    <div style={{ padding: 20 }}>
      {/* Wallet Connect Button */}
      <ConnectButton />

      {currentAccount && (
        <>
          {/* Package ID Form */}
          <div>
            <h3>Set Package ID</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (packageId) {
                  setStatus(`Package ID set to: ${packageId}`);
                } else {
                  setStatus('Please enter a valid package ID.');
                }
              }}
            >
              <input
                type="text"
                value={packageId}
                onChange={(e) => setPackageId(e.target.value)}
                placeholder="Enter Package ID"
                required
              />
              <button type="submit">Set Package ID</button>
            </form>
          </div>

          {/* Create Program Section */}
          <div>
            <h3>Create Program</h3>
            <button
              onClick={async () => {
                await createProgram("title", "description", 1000);

              }}
            >
              Create Program
            </button>
          </div>

          {/* Fetch Programs Section */}
          <div>
            <h3>All Programs</h3>
            <button onClick={fetchPrograms}>Fetch Programs</button>
            <ul>
              {programs.map((program) => (
                <li key={program.id}>
                  <strong>Program ID:</strong> {program.id} <br />
                  <strong>Details:</strong> {JSON.stringify(program.details)} <br />
                  <button
                    onClick={async () => {
                      const amount = parseInt(prompt('Enter Donation Amount:'), 10);

                      if (amount > 0) {
                        setStatus('Donating to program...');
                        await donateToProgram(program.id, amount);
                      } else {
                        setStatus('Invalid donation amount.');
                      }
                    }}
                  >
                    Donate
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Display Status */}
          <div style={{ marginTop: 10, color: 'blue' }}>{status}</div>
        </>
      )}
    </div>
  );
}

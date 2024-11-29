import React, { useState } from "react";
import { useOkto } from "okto-sdk-react";
import { useNavigate } from "react-router-dom";
import ReadData from "./ReadData";

const RawTxnPage = ({ authToken, handleLogout }) => {
	console.log("raw txn page component rendered: ", authToken);
	const navigate = useNavigate();
	const [transferResponse, setTransferResponse] = useState(null);
	const [orderResponse, setOrderResponse] = useState(null);
	const [error, setError] = useState(null);
	const [activeSection, setActiveSection] = useState(null);
	const { executeRawTransaction, getRawTransactionStatus } = useOkto();
	const [transferData, setTransferData] = useState({
		network_name: "",
		transaction: "",
	});
	const [orderData, setOrderData] = useState({
		order_id: "",
	});

	const handleRawTxnExecute = async (e) => {
		console.log("handling exe");
		e.preventDefault();
		try {
			console.log("transferData: ", transferData);
			const rawData = {
				network_name: transferData.network_name,
				transaction: JSON.parse(transferData.transaction),
			};
			console.log("rawdata: ", rawData);
			const response = await executeRawTransaction(rawData);
			console.log("execting: ");
			setTransferResponse(response);
			setActiveSection("transferResponse");
		} catch (error) {
			setError(`Failed to transfer tokens: ${error.message}`);
		}
	};

	const handleInputChange = (e) => {
		setTransferData({ ...transferData, [e.target.name]: e.target.value });
	};

	const handleOrderCheck = async (e) => {
		e.preventDefault();
		try {
			const response = await getRawTransactionStatus(orderData);
			setOrderResponse(response);
			setActiveSection("orderResponse");
		} catch (error) {
			setError(`Failed to fetch order status: ${error.message}`);
		}
	};

	const handleInputChangeOrders = (e) => {
		setOrderData({ ...orderData, [e.target.name]: e.target.value });
	};

	const containerStyle = {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		padding: "20px",
		maxWidth: "800px",
		margin: "0 auto",
	};
	const buttonStyle = {
		margin: "5px",
		padding: "10px 20px",
		fontSize: "16px",
		cursor: "pointer",
	};
	const formStyle = {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		width: "100%",
		maxWidth: "400px",
	};
	const inputStyle = {
		margin: "5px",
		padding: "10px",
		width: "100%",
		fontSize: "16px",
	};

	const navHome = async () => {
		try {
			console.log("going to home page");
			navigate("/home");
		} catch (error) {
			setError(`Failed to navigate: ${error.message}`);
		}
	};

	const navWidget = async () => {
		try {
			console.log("going to widget page");
			navigate("/widget");
		} catch (error) {
			setError(`Failed to navigate: ${error.message}`);
		}
	};

	return (
		<div style={containerStyle}>
			<h1>Raw Transactions</h1>

			{/* Rendering ReadData component and passing handleLogout */}
			<ReadData handleLogout={handleLogout} authToken={authToken} />
			<h2>Perform Raw Txn</h2>
			<form style={formStyle} onSubmit={handleRawTxnExecute}>
				<input
					style={inputStyle}
					type='text'
					name='network_name'
					placeholder='Network Name'
					value={transferData.network_name}
					onChange={handleInputChange}
					required
				/>
				<input
					style={inputStyle}
					type='text'
					name='transaction'
					placeholder='txn object as json string'
					value={transferData.transaction}
					onChange={handleInputChange}
					required
				/>
				<button style={buttonStyle} type='submit'>
					Execute Raw Transaction
				</button>
			</form>
			{activeSection === "transferResponse" && transferResponse && (
				<div>
					<h2>Transaction Response:</h2>
					<pre>{JSON.stringify(transferResponse, null, 2)}</pre>
				</div>
			)}
			<h2>Check Order</h2>
			<form style={formStyle} onSubmit={handleOrderCheck}>
				<input
					style={inputStyle}
					type='text'
					name='order_id'
					placeholder='Order Id'
					value={orderData.order_id}
					onChange={handleInputChangeOrders}
					required
				/>
				<button style={buttonStyle} type='submit'>
					Check Status
				</button>
			</form>
			{activeSection === "orderResponse" && orderResponse && (
				<div>
					<h2>Order Status:</h2>
					<pre>{JSON.stringify(orderResponse, null, 2)}</pre>
				</div>
			)}
			{error && (
				<div style={{ color: "red" }}>
					<h2>Error:</h2>
					<p>{error}</p>
				</div>
			)}
			<div>
				<br />
				<br />
				<button style={buttonStyle} onClick={navHome}>
					go to home
				</button>
				<button style={buttonStyle} onClick={navWidget}>
					Try widgets
				</button>
			</div>
		</div>
	);
};
export default RawTxnPage;

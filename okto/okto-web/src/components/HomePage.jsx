import React, { useEffect, useState } from "react";
import { useOkto } from "okto-sdk-react";
import { useNavigate } from "react-router-dom";
import ReadData from "./ReadData";

const HomePage = ({ authToken, handleLogout }) => {
	const navigate = useNavigate();
	const { transferTokens } = useOkto();

	useEffect(() => {
		console.log("auth token",authToken)
		if (!authToken) {
			navigate("/");
		}
	}, [authToken, navigate]);

	const [transferData, setTransferData] = useState({
		network_name: "",
		token_address: "",
		quantity: "",
		recipient_address: "",
	});
	const [transferResponse, setTransferResponse] = useState(null);
	const [error, setError] = useState(null);

const handleTransferTokens = async (e) => {
	e.preventDefault();
	setError(null);

	if (!authToken) {
		setError("Not authenticated. Please log in again.");
		return;
	}

	if (!transferData.token_address.startsWith("0x")) {
		setError("Token address must start with 0x");
		return;
	}

	const postData = {
		network_name: transferData.network_name.toUpperCase(),
		token_address: transferData.token_address,
		quantity: transferData.quantity,
		recipient_address: transferData.recipient_address,
	};

	try {
		console.log("Sending POST request with data:", postData);

		const response = await fetch(
			"https://sandbox-api.okto.tech/api/v1/transfer/tokens/execute",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`, 
				},
				body: JSON.stringify(postData),
			}
		);

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || "Failed to transfer tokens");
		}

		const responseData = await response.json();
		console.log("Transfer response:", responseData);
		setTransferResponse(responseData);
	} catch (error) {
		console.error("Transfer error details:", error);
		if (error.message.includes("Token Details Not Found")) {
			setError(
				"Invalid token address or network name. Please verify your input."
			);
		} else {
			setError(`Failed to transfer tokens: ${error.message}`);
		}
	}
};


	// Rest of your component remains the same
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setTransferData({ ...transferData, [name]: value });
	};

	const navigateTo = (path) => {
		navigate(path);
	};

	return (
		<div style={{ padding: "20px" }}>
			<h1>Home Page</h1>

			<ReadData handleLogout={handleLogout} authToken={authToken} />

			<h2>Transfer Tokens</h2>
			<form
				onSubmit={handleTransferTokens}
				style={{ maxWidth: "400px", margin: "auto" }}
			>
				<input
					type='text'
					name='network_name'
					placeholder='Network Name'
					value={transferData.network_name}
					onChange={handleInputChange}
					required
					style={{ display: "block", marginBottom: "10px", width: "100%" }}
				/>
				<input
					type='text'
					name='token_address'
					placeholder='Token Address'
					value={transferData.token_address}
					onChange={handleInputChange}
					required
					style={{ display: "block", marginBottom: "10px", width: "100%" }}
				/>
				<input
					type='text'
					name='quantity'
					placeholder='Quantity'
					value={transferData.quantity}
					onChange={handleInputChange}
					required
					style={{ display: "block", marginBottom: "10px", width: "100%" }}
				/>
				<input
					type='text'
					name='recipient_address'
					placeholder='Recipient Address'
					value={transferData.recipient_address}
					onChange={handleInputChange}
					required
					style={{ display: "block", marginBottom: "10px", width: "100%" }}
				/>
				<button
					type='submit'
					style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}
				>
					Transfer Tokens
				</button>
			</form>

			{transferResponse && (
				<div>
					<div style={{ marginBottom: "10px" }}>
						<p>Selected Network: {transferData.network_name}</p>
						<p>Selected Token Address: {transferData.token_address}</p>
					</div>
					<h2>Transfer Response:</h2>
					<pre>{JSON.stringify(transferResponse, null, 2)}</pre>
				</div>
			)}

			{error && (
				<div style={{ color: "red", marginTop: "10px" }}>
					<div style={{ marginBottom: "10px" }}>
						<p>Selected Network: {transferData.network_name}</p>
						<p>Selected Token Address: {transferData.token_address}</p>
					</div>
					<h2>Error:</h2>
					<p>{error}</p>
				</div>
			)}

			<div style={{ marginTop: "20px" }}>
				<button
					onClick={() => navigateTo("/raw")}
					style={{
						padding: "10px 20px",
						marginRight: "10px",
						cursor: "pointer",
					}}
				>
					Go to Raw Transactions
				</button>
				<button
					onClick={() => navigateTo("/widget")}
					style={{ padding: "10px 20px", cursor: "pointer" }}
				>
					Go to Widgets
				</button>
			</div>
		</div>
	);
};

export default HomePage;

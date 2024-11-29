import React, { useState } from "react";
import { useOkto } from "okto-sdk-react";
import { useNavigate } from "react-router-dom";
import ReadData from "./ReadData";

const WidgetPage = ({ authToken, handleLogout }) => {
	const navigate = useNavigate();
	const { showWidgetModal } = useOkto();
	const [error, setError] = useState(null);

	const openWidget = async () => {
		try {
			await showWidgetModal();
		} catch (error) {
			setError(`Failed to show widget: ${error.message}`);
		}
	};

	return (
		<div>
			<h1>Okto UI Widgets</h1>
			<ReadData handleLogout={handleLogout} authToken={authToken} />
			<button onClick={openWidget}>Show Modal</button>
			{error && (
				<div style={{ color: "red" }}>
					<h2>Error:</h2>
					<p>{error}</p>
				</div>
			)}
		</div>
	);
};

export default WidgetPage;

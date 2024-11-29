import React, { useState } from "react";
import { OktoProvider, BuildType } from "okto-sdk-react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import LoginPage from "./components/LoginPage";
import HomePage from "./components/HomePage";
import RawTxnPage from "./components/RawTxnPage";
import WidgetPage from "./components/WidgetPage";

const OKTO_CLIENT_API_KEY = import.meta.env.VITE_OKTO_CLIENT_API_KEY;

function App() {
	const [authToken, setAuthToken] = useState(null);

	const handleLogout = () => {
		setAuthToken(null);
	};

	return (
		<Router>
			<OktoProvider apiKey={OKTO_CLIENT_API_KEY} buildType={BuildType.SANDBOX}>
				<Routes>
					<Route
						path='/'
						element={
							<LoginPage
								setAuthToken={setAuthToken}
								authToken={authToken}
								handleLogout={handleLogout}
							/>
						}
					/>
					<Route
						path='/home'
						element={
							authToken ? (
								<HomePage authToken={authToken} handleLogout={handleLogout} />
							) : (
								<Navigate to='/' />
							)
						}
					/>
					<Route
						path='/raw'
						element={
							authToken ? (
								<RawTxnPage authToken={authToken} handleLogout={handleLogout} />
							) : (
								<Navigate to='/' />
							)
						}
					/>
					<Route
						path='/widget'
						element={
							authToken ? (
								<WidgetPage authToken={authToken} handleLogout={handleLogout} />
							) : (
								<Navigate to='/' />
							)
						}
					/>
				</Routes>
			</OktoProvider>
		</Router>
	);
}

export default App;

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOkto } from "okto-sdk-react";
import { GoogleLogin } from "@react-oauth/google";

const LoginPage = ({ setAuthToken, authToken, handleLogout }) => {
	const navigate = useNavigate();
	const { authenticate } = useOkto();

	
	useEffect(() => {
		if (authToken) {
			navigate("/home");
		}
	}, [authToken, navigate]);

	const containerStyle = {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		padding: "20px",
		maxWidth: "800px",
		margin: "0 auto",
	};

	const handleGoogleLogin = async (credentialResponse) => {
		try {
			console.log("Google login response:", credentialResponse);
			const idToken = credentialResponse.credential;

			if (!idToken) {
				console.error("No ID token received from Google");
				return;
			}

			authenticate(idToken, (authResponse, error) => {
				if (error) {
					console.error("Authentication error:", error);
					return;
				}

				if (authResponse && authResponse.auth_token) {
					console.log("Authentication successful");
					setAuthToken(authResponse.auth_token);

					localStorage.setItem("okto_auth_token", authResponse.auth_token);

					navigate("/home");
				} else {
					console.error("No auth token received from Okto");
				}
			});
		} catch (error) {
			console.error("Login process failed:", error);
		}
	};

	const onLogoutClick = () => {
		handleLogout();
		localStorage.removeItem("okto_auth_token");
		navigate("/");
	};

	return (
		<div style={containerStyle}>
			<h1>Welcome to Token Transfer App</h1>
			<div style={{ marginBottom: "20px" }}>
				{!authToken ? (
					<div>
						<p>Please sign in with Google to continue</p>
						<GoogleLogin
							onSuccess={handleGoogleLogin}
							onError={(error) => {
								console.error("Login Failed:", error);
							}}
							useOneTap
							promptMomentNotification={(notification) =>
								console.log("Prompt moment notification:", notification)
							}
						/>
					</div>
				) : (
					<div>
						<p>You are currently logged in</p>
						<button
							onClick={onLogoutClick}
							style={{
								padding: "10px 20px",
								fontSize: "16px",
								cursor: "pointer",
								backgroundColor: "#f44336",
								color: "white",
								border: "none",
								borderRadius: "4px",
							}}
						>
							Logout
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default LoginPage;

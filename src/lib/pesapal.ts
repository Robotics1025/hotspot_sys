import axios from "axios";

const PESAPAL_BASE_URL = process.env.PESAPAL_MODE === "live"
    ? "https://pay.pesapal.com/v3"
    : "https://cyb3r.pesapal.com/v3";

export interface PesaPalConfig {
    consumerKey: string;
    consumerSecret: string;
}

export async function getPesaPalToken(config: PesaPalConfig) {
    try {
        const response = await axios.post(`${PESAPAL_BASE_URL}/api/Auth/RequestToken`, {
            consumer_key: config.consumerKey,
            consumer_secret: config.consumerSecret,
        });
        return response.data.token;
    } catch (error) {
        console.error("PesaPal Auth Error:", error);
        throw new Error("Failed to authenticate with PesaPal");
    }
}

export async function registerIPN(token: string, url: string) {
    try {
        const response = await axios.post(`${PESAPAL_BASE_URL}/api/URLSetup/RegisterIPN`, {
            url: url,
            ipn_notification_type: "GET",
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("PesaPal IPN Error:", error);
        throw new Error("Failed to register PesaPal IPN");
    }
}

export async function submitOrder(token: string, orderData: Record<string, unknown>) {
    try {
        const response = await axios.post(`${PESAPAL_BASE_URL}/api/Transactions/SubmitOrderRequest`, orderData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("PesaPal Order Error:", error);
        throw new Error("Failed to submit PesaPal order");
    }
}

export async function getTransactionStatus(token: string, trackingId: string) {
    try {
        const response = await axios.get(`${PESAPAL_BASE_URL}/api/Transactions/GetTransactionStatus?orderTrackingId=${trackingId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("PesaPal Status Error:", error);
        throw new Error("Failed to get transaction status");
    }
}

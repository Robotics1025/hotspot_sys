import { nanoid } from "nanoid";

export function generateVoucherCode(length: number = 8): string {
    // Generate uppercase alphanumeric code excluding confusing characters like 0, O, 1, I
    const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    return result;
}

export function calculateCommission(amount: number): { platform: number, client: number } {
    const platform = amount * 0.15;
    const client = amount - platform;
    return {
        platform: Number(platform.toFixed(2)),
        client: Number(client.toFixed(2))
    };
}

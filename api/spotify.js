export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const client_id = process.env.SPOTIFY_CLIENT_ID;
    const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
    const song_id = req.query.id; // Get song ID from request query

    if (!song_id) {
        return res.status(400).json({ error: "Song ID is required" });
    }

    // Step 1: Get Spotify API Token
    const authResponse = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString("base64")}`,
        },
        body: "grant_type=client_credentials",
    });

    const authData = await authResponse.json();
    const access_token = authData.access_token;

    // Step 2: Get Song Features
    const response = await fetch(`https://api.spotify.com/v1/audio-features/${song_id}`, {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });

    const data = await response.json();

    if (data.error) {
        return res.status(500).json({ error: data.error.message });
    }

    res.status(200).json(data);
}
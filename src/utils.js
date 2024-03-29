export function api_url() {
    if (process.env.NODE_ENV === "development") {
        return "https://localhost:5001/darts";
    }
    else if (process.env.NODE_ENV === "production") {
        return "https://drewmccarthy.com/api/darts";
    }
}

export function hub_url() {
    if (process.env.NODE_ENV === "development") {
        return "https://localhost:5001/dartsHub";
    } else if (process.env.NODE_ENV === "production") {
        return "https://drewmccarthy.com/api/dartsHub";
    }
}

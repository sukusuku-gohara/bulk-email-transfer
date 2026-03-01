export async function fetchApi(endpoint: string, payload?: any) {
    const res = await fetch(endpoint, {
        method: payload ? 'POST' : 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        body: payload ? JSON.stringify(payload) : undefined
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with ${res.status}`);
    }

    return res.json();
}

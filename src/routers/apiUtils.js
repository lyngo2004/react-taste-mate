// A small helper that normalizes backend response shapes to the expected data
export function normalizeApiResponse(res) {
    if (!res) return null;
    // If our axios customize returns data by default (res is a data object with EC/DT)
    if (res.DT !== undefined) return res.DT;
    // Common other shapes
    if (res.data !== undefined) return res.data;
    if (Array.isArray(res)) return res;
    // If some endpoints return raw object with data property
    if (res.success && res.data !== undefined) return res.data;
    return null;
}

export default normalizeApiResponse;

// The server replies with { message: "error", errors: [...] },
// so prefer the `errors` array over the generic `message`.
export const getErrorMessages = (error, fallback = "Something went wrong") => {
    const data = error?.response?.data;

    if (Array.isArray(data?.errors) && data.errors.length > 0) {
        return data.errors;
    }
    if (data?.message && data.message !== "error") {
        return [data.message];
    }
    return [error?.message || fallback];
};
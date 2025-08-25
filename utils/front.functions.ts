export const formatDateToSpanish = (date: Date | string | number): string => {
    const dateObj = new Date(date);

    return dateObj
        .toLocaleString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
        .replace(",", "");
};

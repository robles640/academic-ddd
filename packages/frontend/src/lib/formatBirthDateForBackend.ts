// Formatear la fecha antes de enviarla al backend
export function formatBirthDateForBackend(dateString: string) {
    return `${dateString}T00:00:00`;
}

const apiUrl = 'http://localhost:8000'

export const environment = {
    production: false,
    AUTH_URL: `${apiUrl}/api/auth`,
    PROJECTS_URL: `${apiUrl}/api/projects`,
    COMPILE_URL: `${apiUrl}/api/compile`
};
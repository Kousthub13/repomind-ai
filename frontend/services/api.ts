const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    
export async function login(
    email: string,
    password: string,
) {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
            password,
        }),
    });

    if (!response.ok) {
        throw new Error("Invalid email or password");
    }

    return response.json();
}

export async function getProjects(token: string) {
    const response = await fetch(`${API_URL}/projects`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch projects");
    }

    return response.json();
}

export async function getProjectById(
    token: string,
    projectId: string,
) {
    const response = await fetch(
        `${API_URL}/projects/${projectId}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        },
    );

    if (!response.ok) {
        throw new Error("Failed to fetch project");
    }

    return response.json();
}

export async function deleteProject(
    token: string,
    projectId: string,
) {
    const response = await fetch(
        `${API_URL}/projects/${projectId}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        },
    );

    if (!response.ok) {
        throw new Error("Failed to fetch projects");
    }

    return response.json();
}

export async function indexProject(
    token: string,
    projectId: string,
) {
    const response = await fetch(
        `${API_URL}/projects/${projectId}/index`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        },
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
            errorData?.message || "Failed to index project",
        );
    }

    return response.json();
}

export async function searchProject(
    token: string,
    projectId: string,
    query: string,
) {
    const response = await fetch(
        `${API_URL}/projects/${projectId}/search`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query,
            }),
        },
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
            errorData?.message || "Failed to search project",
        );
    }

    return response.json();
}

export async function createProject(
    token: string,
    name: string,
    githubUrl: string,
) {
    const response = await fetch(`${API_URL}/projects`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            name,
            githubUrl,
        }),
    });

    if (!response.ok) {
        throw new Error("Failed to create project");
    }

    return response.json();
}

export async function registerUser(data: {
    email: string;
    password: string;
}) {
    const response = await fetch(
        "http://localhost:3001/users/register",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        },
    );

    if (!response.ok) {
        throw new Error("Registration failed");
    }

    return response.json();
}
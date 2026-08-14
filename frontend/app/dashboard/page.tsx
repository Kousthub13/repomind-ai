"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    getProjects,
    deleteProject,
} from "@/services/api";
import { useAppSelector } from "@/store/hooks";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slice/authSlice";

interface Project {
    id: string;
    name: string;
    githubUrl: string;
}

export default function DashboardPage() {
    const router = useRouter();

    const dispatch = useAppDispatch();
    const token = useAppSelector((state) => state.auth.token);

    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!token) {
            router.push("/login");
            return;
        }

        const fetchProjects = async () => {
            try {
                const data = await getProjects(token);
                setProjects(data);
            } catch (error) {
                console.error(error);
                setError("Failed to load projects.");
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [token, router]);

    const handleLogout = () => {
        dispatch(logout());
        router.push("/login");
    };

    const handleDeleteProject = async (projectId: string) => {
        if (!token) {
            router.push("/login");
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to delete this project?",
        );

        if (!confirmed) {
            return;
        }

        try {
            await deleteProject(token, projectId);

            setProjects((currentProjects) =>
                currentProjects.filter(
                    (project) => project.id !== projectId,
                ),
            );
        } catch (error) {
            console.error(error);
            setError("Failed to delete project.");
        }
    };

    return (
        <main className="min-h-screen bg-gray-100">
            <nav className="border-b bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">
                        RepoMind AI
                    </h1>

                    <button
                        onClick={handleLogout}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <section className="mx-auto max-w-7xl px-8 py-10">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">
                            Your Projects
                        </h2>

                        <p className="mt-2 text-gray-600">
                            Manage your GitHub repositories and explore them
                            with AI.
                        </p>
                    </div>

                    <button
                        onClick={() => router.push("/projects/new")}
                        className="rounded-lg bg-black px-5 py-3 font-medium text-white hover:bg-gray-800"
                    >
                        + Add Repository
                    </button>
                </div>

                {loading && (
                    <div className="rounded-xl bg-white p-12 text-center">
                        <p className="text-gray-600">
                            Loading projects...
                        </p>
                    </div>
                )}

                {error && (
                    <div className="rounded-xl bg-red-50 p-6 text-center">
                        <p className="text-red-600">{error}</p>
                    </div>
                )}

                {!loading && !error && projects.length === 0 && (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
                        <h3 className="text-xl font-semibold text-gray-900">
                            No projects yet
                        </h3>

                        <p className="mt-2 text-gray-600">
                            Add a GitHub repository to start analyzing your
                            code.
                        </p>

                        <button
                            onClick={() => router.push("/projects/new")}
                            className="mt-6 rounded-lg bg-black px-5 py-3 font-medium text-white hover:bg-gray-800"
                        >
                            + Add Repository
                        </button>
                    </div>
                )}

                {!loading && !error && projects.length > 0 && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {projects.map((project) => (
                            <div
                                key={project.id}
                                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
                            >
                                <h3 className="text-xl font-semibold text-gray-900">
                                    {project.name}
                                </h3>

                                <p className="mt-2 break-all text-sm text-gray-500">
                                    {project.githubUrl}
                                </p>

                                <div className="mt-6 flex items-center justify-between">
                                    <button
                                        onClick={() =>
                                            router.push(
                                                `/projects/${project.id}`,
                                            )
                                        }
                                        className="font-medium text-gray-900 hover:underline"
                                    >
                                        Open Project →
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleDeleteProject(project.id)
                                        }
                                        className="font-medium text-red-600 hover:text-red-800"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
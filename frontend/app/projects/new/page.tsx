"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "@/services/api";
import { useAppSelector } from "@/store/hooks";

export default function NewProjectPage() {
    const router = useRouter();

    const token = useAppSelector((state) => state.auth.token);

    const [name, setName] = useState("");
    const [githubUrl, setGithubUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        if (!token) {
            router.push("/login");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await createProject(token, name, githubUrl);

            router.push("/dashboard");
        } catch (error) {
            console.error(error);
            setError("Failed to create project.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-100">
            <nav className="border-b bg-white">
                <div className="mx-auto max-w-7xl px-8 py-4">
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                        ← Back to Projects
                    </button>
                </div>
            </nav>

            <section className="mx-auto max-w-2xl px-8 py-10">
                <div className="rounded-xl bg-white p-8 shadow-sm">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Add Repository
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Connect a GitHub repository to RepoMind AI.
                    </p>

                    <form
                        onSubmit={handleSubmit}
                        className="mt-8 space-y-5"
                    >
                        <div>
                            <label
                                htmlFor="name"
                                className="mb-1 block text-sm font-medium text-gray-800"
                            >
                                Project Name
                            </label>

                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                                placeholder="NestJS Repository"
                                required
                                className="w-full rounded-lg border border-gray-300 px-3 py-3 text-gray-900 outline-none focus:border-black focus:ring-1 focus:ring-black"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="githubUrl"
                                className="mb-1 block text-sm font-medium text-gray-800"
                            >
                                GitHub Repository URL
                            </label>

                            <input
                                id="githubUrl"
                                type="url"
                                value={githubUrl}
                                onChange={(event) =>
                                    setGithubUrl(event.target.value)
                                }
                                placeholder="https://github.com/nestjs/nest"
                                required
                                className="w-full rounded-lg border border-gray-300 px-3 py-3 text-gray-900 outline-none focus:border-black focus:ring-1 focus:ring-black"
                            />
                        </div>

                        {error && (
                            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => router.push("/dashboard")}
                                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 rounded-lg bg-black px-4 py-3 font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading
                                    ? "Creating..."
                                    : "Create Repository"}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </main>
    );
}
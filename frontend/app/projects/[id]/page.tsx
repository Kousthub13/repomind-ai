"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    getProjectById,
    indexProject,
    searchProject,
} from "@/services/api";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useAppSelector } from "@/store/hooks";

interface Project {
    id: string;
    name: string;
    githubUrl: string;
    createdAt: string;
    isIndexed: boolean;
}

interface SearchResult {
    answer: string;
    sources: {
        path: string;
        chunkIndex: number;
        similarity: number;
    }[];
}

export default function ProjectDetailsPage() {
    const router = useRouter();
    const params = useParams();

    const token = useAppSelector(
        (state) => state.auth.token,
    );

    const [project, setProject] = useState<Project | null>(
        null,
    );

    const [loading, setLoading] = useState(true);
    const [indexing, setIndexing] = useState(false);

    const [query, setQuery] = useState("");
    const [searching, setSearching] = useState(false);
    const [result, setResult] =
        useState<SearchResult | null>(null);

    const [error, setError] = useState("");

    const projectId = params.id as string;

    useEffect(() => {
        if (!token) {
            router.push("/login");
            return;
        }

        const fetchProject = async () => {
            try {
                const data = await getProjectById(
                    token,
                    projectId,
                );

                setProject(data);
            } catch (error) {
                console.error(error);
                setError("Failed to load project.");
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [token, projectId, router]);

    const handleIndexProject = async () => {
        if (!token) {
            router.push("/login");
            return;
        }

        setIndexing(true);
        setError("");

        try {
            await indexProject(token, projectId);

            alert("Project indexed successfully!");
        } catch (error) {
            console.error(error);
        
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to index project. Please try again.",
            );
        } finally {
            setIndexing(false);
        }
    };

    const handleSearch = async () => {
        if (!token || !query.trim()) {
            return;
        }

        setSearching(true);
        setResult(null);
        setError("");

        try {
            const data = await searchProject(
                token,
                projectId,
                query,
            );

            setResult(data);
        } catch (error) {
            console.error(error);
        
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to search the repository.",
            );
        } finally {
            setSearching(false);
        }
    };

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-gray-100">
                <p className="text-gray-600">
                    Loading project...
                </p>
            </main>
        );
    }

    if (error && !project) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-gray-100">
                <div className="rounded-xl bg-white p-8 text-center shadow-sm">
                    <p className="text-red-600">
                        {error}
                    </p>

                    <button
                        onClick={() =>
                            router.push("/dashboard")
                        }
                        className="mt-4 rounded-lg bg-black px-5 py-2 text-white"
                    >
                        Back to Projects
                    </button>
                </div>
            </main>
        );
    }

    if (!project) {
        return null;
    }

    return (
        <main className="min-h-screen bg-gray-100">
            <nav className="border-b bg-white">
                <div className="mx-auto max-w-7xl px-8 py-4">
                    <button
                        onClick={() =>
                            router.push("/dashboard")
                        }
                        className="text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                        ← Back to Projects
                    </button>
                </div>
            </nav>

            <section className="mx-auto max-w-5xl px-8 py-10">

                {/* Project Information */}
                <div className="rounded-xl bg-white p-8 shadow-sm">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {project.name}
                    </h1>

                    <p className="mt-3 break-all text-gray-600">
                        {project.githubUrl}
                    </p>

                    <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-block font-medium text-gray-900 hover:underline"
                    >
                        View on GitHub →
                    </a>
                </div>

                {/* Repository Index */}
                <div className="mt-6 rounded-xl bg-white p-8 shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Repository Index
                    </h2>

                    {project.isIndexed ? (
                        <p className="mt-2 text-green-600">
                            ✓ This repository has been indexed and is ready
                            for AI code search.
                        </p>
                    ) : (
                        <p className="mt-2 text-gray-600">
                            Index this repository so RepoMind AI can
                            understand and search its source code.
                        </p>
                    )}

                    {error && (
                        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleIndexProject}
                        disabled={indexing}
                        className="mt-6 rounded-lg bg-black px-5 py-3 font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {indexing
                            ? "Indexing Repository..."
                            : project.isIndexed
                                ? "Re-index Repository"
                                : "Index Repository"}
                    </button>
                </div>

                {/* AI Code Search */}
                <div className="mt-6 rounded-xl bg-white p-8 shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-900">
                        AI Code Search
                    </h2>

                    <p className="mt-2 text-gray-600">
                        Ask questions about your repository after
                        indexing it.
                    </p>

                    {/* Search Input */}
                    <div className="mt-5 flex gap-3">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) =>
                                setQuery(e.target.value)
                            }
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleSearch();
                                }
                            }}
                            placeholder="Ask a question about your code..."
                            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-gray-400"
                        />

                        <button
                            onClick={handleSearch}
                            disabled={
                                searching ||
                                !query.trim()
                            }
                            className="rounded-lg bg-black px-6 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {searching
                                ? "Asking..."
                                : "Ask AI"}
                        </button>
                    </div>

                    {/* AI Result */}
                    {result && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-gray-900">
                                AI Answer
                            </h3>

                            <div className="mt-3 rounded-lg bg-gray-50 p-5">
                                <div className="text-gray-800">
                                    <ReactMarkdown
                                        components={{
                                            code({ className, children, ...props }) {
                                                const match = /language-(\w+)/.exec(
                                                    className || "",
                                                );

                                                return match ? (
                                                    <SyntaxHighlighter
                                                        style={vscDarkPlus}
                                                        language={match[1]}
                                                        PreTag="div"
                                                        customStyle={{
                                                            margin: "12px 0",
                                                            borderRadius: "8px",
                                                            padding: "16px",
                                                        }}
                                                    >
                                                        {String(children).replace(/\n$/, "")}
                                                    </SyntaxHighlighter>
                                                ) : (
                                                    <code
                                                        className="rounded bg-gray-200 px-1 py-0.5 text-sm"
                                                        {...props}
                                                    >
                                                        {children}
                                                    </code>
                                                );
                                            },
                                        }}
                                    >
                                        {result.answer}
                                    </ReactMarkdown>
                                </div>
                            </div>

                            {/* Sources */}
                            {result.sources.length > 0 && (
                                <div className="mt-5">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Relevant Sources
                                    </h3>

                                    <div className="mt-3 space-y-2">
                                        {result.sources.map(
                                            (
                                                source,
                                                index,
                                            ) => (
                                                <div
                                                    key={`${source.path}-${source.chunkIndex}-${index}`}
                                                    className="rounded-lg border border-gray-200 bg-white p-3"
                                                >
                                                    <p className="font-medium text-gray-900">
                                                        {
                                                            source.path
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-sm text-gray-500">
                                                        Chunk{" "}
                                                        {
                                                            source.chunkIndex
                                                        }{" "}
                                                        ·
                                                        Similarity{" "}
                                                        {source.similarity.toFixed(
                                                            2,
                                                        )}
                                                    </p>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
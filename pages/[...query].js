import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Card, CardContent, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";

function SearchResult() {
    const router = useRouter();
    const { query } = router;

    const [loading, setLoading] = useState(false);
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        // Simulate API call
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch("/api/scrape", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        title: query.title,
                        location: query.location,
                        results: query.numJobs,
                    }),
                });

                if (!response.ok) {
                    throw new Error("Response not ok");
                }

                if (response.status === 200) {
                    const data = await response.json();
                    console.log("DATA: ", data);

                    // Create new job objects, omitting properties that have "unavailable" as their value
                    const availableJobs = data.fetchedResults.map((job) => {
                        const newJob = {};
                        for (const [key, value] of Object.entries(job)) {
                            if (value.toLowerCase() !== "unavailable") {
                                newJob[key] = value;
                            }
                        }
                        return newJob;
                    });

                    setSearchResults(availableJobs);
                }
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [query.title, query.location, query.results]);

    return (
        <div className="container p-12 px-4 mx-auto">
            <h1 className="py-4 mb-6 text-4xl font-semibold text-center">
                Search Results
            </h1>
            <div className="flex justify-between mb-6">
                <p className="mb-6 text-lg">
                    Job Title:{" "}
                    <span className="font-semibold">{query.title}</span>
                </p>
                <p className="text-lg">
                    Location:{" "}
                    <span className="font-semibold">{query.location}</span>
                </p>
                <p className="text-lg">
                    Results:{" "}
                    <span className="font-semibold">
                        {searchResults.length}
                    </span>
                </p>
            </div>

            {loading ? (
                <Box sx={{ width: "100%" }}>
                    <LinearProgress />
                </Box>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {searchResults.map((job, index) => (
                        <div
                            key={index}
                            className="flex flex-col p-8 m-2 bg-white rounded shadow-lg"
                        >
                            {job.jobTitle && (
                                <h2 className="mb-3 text-lg font-semibold">
                                    {job.jobTitle}
                                </h2>
                            )}
                            {job.companyName && (
                                <p className="my-2">
                                    <strong>Company:</strong> {job.companyName}
                                </p>
                            )}
                            {job.salary && (
                                <p className="my-2 text-xl">{job.salary}</p>
                            )}
                            {job.description && (
                                <p className="my-2">{job.description}</p>
                            )}
                            {job.applyLink && (
                                <div className="mt-6">
                                    <a
                                        href={job.applyLink}
                                        className="w-full px-3 py-2 text-white bg-blue-500 rounded hover:text-blue-700"
                                    >
                                        Apply here
                                    </a>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SearchResult;

import React, { useState } from "react";
import Select from "react-select";
import { useRouter } from "next/router";

export default function Home() {
    const router = useRouter();
    const [selectedTitle, setSelectedTitle] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [numJobs, setNumJobs] = useState(15); // Default value is 15

    const jobTitles = [
        "Web Developer",
        "Software Engineer",
        "Database Administrator",
        "UX Designer",
        "Cloud Solutions Architect",
        "IT Manager",
        "DevOps Engineer",
        "Cybersecurity Analyst",
        "Data Scientist",
        "IT Support Specialist",
    ].map((title) => ({ label: title, value: title }));

    const jobLocations = [
        "United States",
        "United Kingdom",
        "Germany",
        "Canada",
        "Australia",
        "France",
        "Netherlands",
        "Brazil",
        "Singapore",
    ].map((location) => ({ label: location, value: location }));

    const handleSubmit = (e) => {
        e.preventDefault();
        router.push(
            `/search?title=${selectedTitle.value}&location=${selectedLocation.value}&numJobs=${numJobs}`
        );
    };

    return (
        <div className="container h-full mx-auto">
            <h1 className="py-4 mb-12 text-4xl font-semibold text-center">
                Search for IT jobs
            </h1>
            <div className="w-1/2 mx-auto">
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-bold text-gray-700">
                            Job Title
                        </label>
                        <Select
                            options={jobTitles}
                            onChange={setSelectedTitle}
                            className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                            isSearchable={false}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-bold text-gray-700">
                            Location
                        </label>
                        <Select
                            options={jobLocations}
                            onChange={setSelectedLocation}
                            className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                            isSearchable={false}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-bold text-gray-700">
                            Number of Jobs
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={numJobs}
                            onChange={(e) => setNumJobs(e.target.value)}
                            className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            className="w-full px-4 py-2 mt-12 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline"
                            type="submit"
                        >
                            Search
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

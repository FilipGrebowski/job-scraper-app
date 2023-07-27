import puppeteer from "puppeteer-core";
import { createObjectCsvWriter } from "csv-writer";

const csvWriter = createObjectCsvWriter({
    path: "out.csv",
    header: [
        { id: "jobTitle", title: "JOB TITLE" },
        { id: "companyName", title: "COMPANY NAME" },
        { id: "location", title: "LOCATION" },
        { id: "salary", title: "SALARY" },
        { id: "description", title: "DESCRIPTION" },
        { id: "applyLink", title: "APPLY LINK" },
    ],
    append: true,
});

const auth = "USERNAME:PASSWORD";

export default async function run(req, res) {
    let browser;
    try {
        console.log("Connecting to browser...");
        browser = await puppeteer.connect({
            browserWSEndpoint: `wss://${auth}@brd.superproxy.io:9222`,
            ignoreHTTPSErrors: true,
        });

        console.log("Opening new page...");
        const page = await browser.newPage();
        await page.goto("https://uk.indeed.com", { waitUntil: "networkidle0" });

        // Extract title, location, and results from the request body
        const { title, location, results } = req.body;
        console.log(req.body);
        const maxResults = parseInt(results);

        console.log(
            "Printing payload. Location: " + location + " Title: " + title
        );

        console.log("Taking screenshot #1.");
        await page.screenshot({ path: "./screenshot.png" });

        // Clear the 'Where' input field before entering the location
        await page.click("#text-input-where", { clickCount: 3 }); // Triple clicking will select all text
        await page.keyboard.press("Backspace"); // Pressing backspace will remove the text

        // Enter a job title in the 'What' input field
        await page.type("#text-input-what", title);

        // Enter a location in the 'Where' input field
        await page.type("#text-input-where", location);

        // Submit the form
        await Promise.all([
            page.waitForNavigation({ waitUntil: "networkidle0" }),
            page.click(".yosegi-InlineWhatWhere-primaryButton"),
        ]);

        console.log("Taking screenshot #2.");
        await page.screenshot({ path: "./screenshot-1.png" });

        let fetchedResults = [];

        let currentPage = 1;

        while (fetchedResults.length < maxResults) {
            // Wait for the page to load
            await page.waitForTimeout(5000);

            const jobDataElements = await page.$$eval(
                ".jobsearch-ResultsList li",
                (nodes) =>
                    nodes
                        .map((node) => {
                            if (node.querySelector(".jobTitle")) {
                                // Check if the li item has the jobTitle class
                                const jobTitle =
                                    node.querySelector(".jobTitle")
                                        ?.textContent ?? "Unavailable";
                                const companyName =
                                    node.querySelector(".companyName")
                                        ?.textContent ?? "Unavailable";
                                const location =
                                    node.querySelector(".locationName")
                                        ?.textContent ?? "Unavailable";
                                const salary =
                                    node.querySelector(
                                        ".salaryOnly .attribute_snippet"
                                    )?.textContent ?? "Unavailable";
                                const description =
                                    node.querySelector(".job-snippet")
                                        ?.textContent ?? "Unavailable";
                                const applyLink =
                                    node.querySelector(".jobTitle > a")?.href ??
                                    "Unavailable";

                                return {
                                    jobTitle,
                                    companyName,
                                    location,
                                    salary,
                                    description,
                                    applyLink,
                                };
                            } else {
                                // If not, return null
                                return null;
                            }
                        })
                        .filter(Boolean)
            ); // This will remove null entries from the array

            console.log(`Scraped ${jobDataElements.length} job postings`);

            // // Add results to fetchedResults and write data to CSV
            // for (let i = 0; i < jobDataElements.length; i++) {
            //     fetchedResults.push(jobDataElements[i]);
            //     console.log(JSON.stringify(jobDataElements[i], null, 2));
            //     await csvWriter.writeRecords([jobDataElements[i]]);
            //     console.log(`Wrote job posting ${i + 1} to CSV`);
            // }

            // Add results to fetchedResults and write data to CSV
            for (let i = 0; i < jobDataElements.length; i++) {
                // If salary contains the "£" symbol, add to results and write to CSV
                if (jobDataElements[i].salary.includes("£")) {
                    if (fetchedResults.length < maxResults) {
                        fetchedResults.push(jobDataElements[i]);
                        console.log(
                            JSON.stringify(jobDataElements[i], null, 2)
                        );
                        await csvWriter.writeRecords([jobDataElements[i]]);
                        console.log(`Wrote job posting ${i + 1} to CSV`);
                        await new Promise((resolve) =>
                            setTimeout(resolve, 1000)
                        ); // Delay for 1 second
                    } else {
                        break;
                    }
                }
            }

            // If there are more pages to scrape, click the next page button
            if (fetchedResults.length < maxResults) {
                try {
                    await page.waitForSelector(
                        '[data-testid="pagination-page-next"]',
                        { visible: true, timeout: 5000 }
                    );
                    await Promise.all([
                        page.waitForNavigation({ waitUntil: "networkidle0" }),
                        page.click('[data-testid="pagination-page-next"]'),
                    ]);
                } catch (error) {
                    console.log(
                        `Skipping page ${
                            currentPage + 1
                        } due to error: ${error}`
                    );
                }
            }
            currentPage++;
        }

        res.status(200).json({ fetchedResults });
        console.log("Done.");
    } catch (e) {
        console.error("run failed", e);
        res.status(404);
    } finally {
        await browser?.disconnect();
    }
}

if (require.main == module) run();

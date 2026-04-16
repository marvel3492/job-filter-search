function stringToSalary(salary, storage) {
    let newSalary = salary.toString();
    const k = newSalary.charAt(newSalary.length - 1) === "K";
    if (k) {
        newSalary = newSalary.substring(0, newSalary.length - 1);
    }

    const dash = newSalary.indexOf("-");
    if (dash >= 0) {
        if (storage.salaryCompare === "min") {
            newSalary = newSalary.substring(0, dash);
        } else if (storage.salaryCompare === "max") {
            newSalary = "$" + newSalary.substring(dash + 1);
        }
    }

    newSalary = parseFloat(newSalary.substring(1));
    if (k) {
        newSalary *= 1000.0;
    }

    return newSalary;
}

function stringToSalary2(salary, data) {
    let newSalary = salary.toString();
    const dash = newSalary.indexOf("-");
    if (dash >= 0) {
        if (storage.salaryCompare === "min") {
            newSalary = newSalary.substring(0, dash - 1);
        } else if (storage.salaryCompare === "max") {
            newSalary = "$" + newSalary.substring(dash + 2);
        }
    }

    const k = newSalary.charAt(newSalary.length - 1) === "K";
    if (k) {
        newSalary = newSalary.substring(0, newSalary.length - 1);
    }

    newSalary = parseFloat(newSalary.substring(1));
    if (k) {
        newSalary *= 1000.0;
    }

    return newSalary;
}

async function search() {
    let storage = await getStorage();
    if (storage.salaryFrequency === "hr") {
        storage.salary *= 40.0 * 52.0;
    } else if (storage.salaryFrequency === "mo") {
        storage.salary *= 40.0 * 52.0 / 12.0;
    }

    if (location.href.includes("joinhandshake.com")) {
        const cards = document.querySelectorAll("[data-hook*='job-result-card |']");
        cards.forEach(card => {
            let result = 1; // 0 = filtered; 1 = passed
            const state = card.querySelector("[data-hook]").children[0].innerHTML;
            if (storage.state !== "" && state.indexOf("Remote") < 0 && state.indexOf(storage.state) < 0) {
                result = 0;
            }

            let salary = card.children[2].children[0].children[1].children[0].children[1].children[0].innerHTML;
            const hr = salary.indexOf("/hr");
            const mo = salary.indexOf("/mo");
            const yr = salary.indexOf("/yr");
            const unpaid = salary.indexOf("Unpaid");
            if (unpaid >= 0) {
                if (0 < roundDollar(storage.salary)) {
                    result = 0;
                }
            } else {
                if (hr >= 0) {
                    salary = salary.substring(0, hr);
                    salary = stringToSalary(salary, storage);
                    salary *= 40.0 * 52.0;
                } else if (mo >= 0) {
                    salary = salary.substring(0, mo);
                    salary = stringToSalary(salary, storage);
                    salary *= 12.0;
                } else if (yr >= 0) {
                    salary = salary.substring(0, yr);
                    salary = stringToSalary(salary, storage);
                }
                if (roundDollar(salary) < roundDollar(storage.salary)) {
                    result = 0;
                }
            }

            const name = card.querySelector("[role='region']").children[0].children[0].children[0].children[0].innerHTML;
            for (const company of storage.companies.values()) {
                if (name.trim().toLowerCase() === company.trim().toLowerCase()) {
                    result = 0;
                }
            }

            if (result === 0) {
                card.classList.add("strike-all");
            } else {
                card.classList.remove("strike-all");
            }
        });
    } else if (location.href.includes("linkedin.com")) {
        const cards = document.querySelectorAll("[data-occludable-job-id]");
        cards.forEach(card => {
            let result = 1; // 0 = filtered; 1 = passed
            const subtitle = card.querySelector(".artdeco-entity-lockup__subtitle");
            const title = card.querySelector(".artdeco-entity-lockup__title");
            const caption = card.querySelector(".artdeco-entity-lockup__caption");
            if (subtitle !== null && title !== null && caption !== null) {
                const metadata = card.querySelector(".artdeco-entity-lockup__metadata");
                if (metadata !== null) {
                    let salary = metadata.querySelector("[dir='ltr']").innerHTML.replaceAll("<!---->", "").trim();
                    const hr = salary.indexOf("/hr");
                    const mo = salary.indexOf("/mo");
                    const yr = salary.indexOf("/yr");
                    if (hr >= 0) {
                        salary = salary.substring(0, hr);
                        salary = stringToSalary2(salary, storage);
                        salary *= 40.0 * 52.0;
                    } else if (mo >= 0) {
                        salary = salary.substring(0, mo);
                        salary = stringToSalary2(salary, storage);
                        salary *= 12.0;
                    } else if (yr >= 0) {
                        salary = salary.substring(0, yr);
                        salary = stringToSalary2(salary, storage);
                    }
                    if (roundDollar(salary) < roundDollar(storage.salary)) {
                        result = 0;
                    }
                }

                const name = subtitle.querySelector("[dir='ltr']").innerHTML.replaceAll("<!---->", "").trim();
                for (const company of storage.companies.values()) {
                    if (name.trim().toLowerCase() === company.trim().toLowerCase()) {
                        result = 0;
                    }
                }

                if (storage.verified) {
                    const verified = title.querySelector(".text-view-model__verified-icon");
                    if (verified === null && storage.verified) {
                        result = 0;
                    }
                }

                if (result === 0) {
                    subtitle.classList.add("strike-all");
                    title.classList.add("strike-all");
                } else {
                    subtitle.classList.remove("strike-all");
                    title.classList.remove("strike-all");
                }
            }
        });
    }
}

// Run when the page loads
search();

// Run again whenever the page updates (Handshake uses dynamic loading)
const observer = new MutationObserver(search);
observer.observe(document.body, { childList: true, subtree: true });

chrome.storage.onChanged.addListener((_changes, area) => {
    if (area === "local") {
        search();
    }
});
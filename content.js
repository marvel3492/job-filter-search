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

function isOnCompanyBlacklist(cardCompany, companies) {
    for (const company of companies.values()) {
        if (cardCompany.trim().toLowerCase() === company.trim().toLowerCase()) {
            return true;
        }
    }

    return false;
}

function isOnLocationBlacklist(cardLocation, locations) {
    for (const location of locations.values()) {
        if (cardLocation.trim().toLowerCase().indexOf(location.trim().toLowerCase()) !== -1) {
            return true;
        }
    }

    return false;
}

async function search() {
    try {
        let storage = await getStorage();
        if (storage.salaryFrequency === "hr") {
            storage.salary *= 40.0 * 52.0;
        } else if (storage.salaryFrequency === "mo") {
            storage.salary *= 40.0 * 52.0 / 12.0;
        }

        if (location.href.includes("joinhandshake.com")) {
            const cards = document.querySelectorAll("[data-hook*='job-result-card |']");
            cards.forEach(card => {
                let reason = "";
                const footerChildren = card.querySelector("[data-hook='job-result-card-footer']").children;
                const state1 = footerChildren[0].innerHTML;
                if (storage.state !== "" && state1 !== "Remote" && state1.indexOf(storage.state) < 0) {
                    if (footerChildren.length > 2) {
                        const state2 = footerChildren[2].innerHTML;
                        if (storage.state !== "" && state2 !== "Remote" && state2.indexOf(storage.state) < 0) {
                            reason = "Non-whitelisted state"
                        }
                    } else {
                        reason = "Non-whitelisted state"
                    }
                }

                let salary = card.children[2].children[0].children[1].children[0].children[1].children[0].innerHTML;
                const hr = salary.indexOf("/hr");
                const mo = salary.indexOf("/mo");
                const yr = salary.indexOf("/yr");
                const unpaid = salary.indexOf("Unpaid");
                if (unpaid >= 0) {
                    if (0.0 < roundDollar(storage.salary)) {
                        reason = "Unpaid"
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
                        reason = "Insufficient salary"
                    }
                }

                const region = card.querySelector("[role='region']");
                const cardCompany = region.children[0].children[0].children[0].children[0].innerHTML;
                if (isOnCompanyBlacklist(cardCompany, storage.companies)) {
                    reason = "Blacklisted company"
                }

                const cardLocation = card.querySelector("[data-hook]").children[0].innerHTML;
                if (isOnLocationBlacklist(cardLocation, storage.locations)) {
                    reason = "Blacklisted location"
                }

                if (reason !== "") {
                    region.children[0].classList.add("strike-all");
                    region.children[1].classList.add("strike-all");

                    let reasonDiv = card.querySelector("[id='reason']");
                    if (reasonDiv === null) {
                        reasonDiv = document.createElement("div");
                        reasonDiv.id = "reason";
                        reasonDiv.innerHTML = "Reason: " + reason;
                        region.appendChild(reasonDiv);
                    } else {
                        reasonDiv.innerHTML = "Reason: " + reason;
                    }
                } else {
                    region.children[0].classList.remove("strike-all");
                    region.children[1].classList.remove("strike-all");
                    
                    const reasonDiv = card.querySelector("[id='reason']");
                    if (reasonDiv !== null) {
                        reasonDiv.remove();
                    }
                }
            });
        } else if (location.href.includes("linkedin.com")) {
            const cards = document.querySelectorAll("[data-occludable-job-id]");
            cards.forEach(card => {
                let reason = "";
                const subtitle = card.querySelector(".artdeco-entity-lockup__subtitle");
                const title = card.querySelector(".artdeco-entity-lockup__title");
                const caption = card.querySelector(".artdeco-entity-lockup__caption");
                if (subtitle !== null && title !== null && caption !== null) {
                    const cardCompany = subtitle.querySelector("[dir='ltr']");
                    const cardLocation = caption.querySelector("[dir='ltr']");
                    if (cardCompany !== null && cardLocation !== null) {
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
                                reason = "Insufficient salary"
                            }
                        }

                        if (isOnCompanyBlacklist(cardCompany.innerHTML.replaceAll("<!---->", "").trim(), storage.companies)) {
                            reason = "Blacklisted company"
                        }

                        if (isOnLocationBlacklist(cardLocation.innerHTML.replaceAll("<!---->", "").trim(), storage.locations)) {
                            reason = "Blacklisted location"
                        }

                        if (storage.verified) {
                            const verified = title.querySelector(".text-view-model__verified-icon");
                            if (verified === null && storage.verified) {
                                reason = "Not verified"
                            }
                        }

                        if (reason !== "") {
                            subtitle.classList.add("strike-all");
                            title.classList.add("strike-all");

                            let reasonDiv = card.querySelector("[id='reason']");
                            if (reasonDiv === null) {
                                reasonDiv = document.createElement("div");
                                reasonDiv.id = "reason";
                                reasonDiv.innerHTML = "Reason: " + reason;
                                card.querySelector(".job-card-container").children[0].appendChild(reasonDiv);
                            } else {
                                reasonDiv.innerHTML = "Reason: " + reason;
                            }
                        } else {
                            subtitle.classList.remove("strike-all");
                            title.classList.remove("strike-all");

                            const reasonDiv = card.querySelector("[id='reason']");
                            if (reasonDiv !== null) {
                                reasonDiv.remove();
                            }
                        }
                    }
                }
            });
        }
    } catch (e) {
        console.error("Error:", e);
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
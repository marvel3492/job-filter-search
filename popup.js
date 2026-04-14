let companies = new Set();

function showBlacklist() {
    document.getElementById("companyDiv").innerHTML = "";
    const ul = document.createElement("ul");
    for (const company of companies) {
        const li = document.createElement("li");
        li.innerHTML = company + "&nbsp;";
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = "Remove";
        button.addEventListener("click", () => {
            companies.delete(company);
            showBlacklist();
            document.getElementById("updateDiv").innerHTML = "";
        });

        li.appendChild(button);
        ul.appendChild(li);
        document.getElementById("companyDiv").appendChild(ul);
    }
}

function showSalary(salary) {
    const formatted = Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(salary);
    return Number.isInteger(salary) ? formatted : formatted.padEnd(formatted.indexOf(".") + 3, "0");
}

function changeSalaryDiv(hr, mo, yr) {
    document.getElementById("salaryDiv").innerHTML = `<ul><li>$${showSalary(hr)}/hr</li><li>$${showSalary(mo)}/mo</li><li>$${showSalary(yr)}/yr</li></ul>`;
}

function showSalaries() {
    if (!isNaN(parseFloat(document.getElementById("salary").value))) {
        if (document.getElementById("salaryFrequency").value == "hr") {
            const hr = roundDollar(parseFloat(document.getElementById("salary").value));
            const mo = roundDollar(hr * 40.0 * 52.0 / 12.0);
            const yr = roundDollar(hr * 40.0 * 52.0);
            changeSalaryDiv(hr, mo, yr);
        } else if (document.getElementById("salaryFrequency").value == "mo") {
            const mo = roundDollar(parseFloat(document.getElementById("salary").value));
            const hr = roundDollar(mo / (40.0 * 52.0 / 12.0));
            const yr = roundDollar(mo * 12.0);
            changeSalaryDiv(hr, mo, yr);
        } else if (document.getElementById("salaryFrequency").value == "yr") {
            const yr = roundDollar(parseFloat(document.getElementById("salary").value));
            const hr = roundDollar(yr / (40.0 * 52.0));
            const mo = roundDollar(yr / 12.0);
            changeSalaryDiv(hr, mo, yr);
        } else {
            const yr = roundDollar(0.0);
            const hr = roundDollar(0.0);
            const mo = roundDollar(0.0);
            changeSalaryDiv(hr, mo, yr);
        }
    } else {
        const yr = roundDollar(0.0);
        const hr = roundDollar(0.0);
        const mo = roundDollar(0.0);
        changeSalaryDiv(hr, mo, yr);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const stateElement = document.getElementById("state");
    const salaryElement = document.getElementById("salary");
    const salaryFrequencyElement = document.getElementById("salaryFrequency");
    const salaryCompareElement = document.getElementById("salaryCompare");
    const companyElement = document.getElementById("company");
    const verifiedElement = document.getElementById("verified");
    const updateDivElement = document.getElementById("updateDiv");
    chrome.storage.local.get(["state", "salary", "salaryFrequency", "salaryCompare", "companies", "verified"], data => {
        stateElement.value = data.state || "";
        salaryElement.value = data.salary || "";
        salaryFrequencyElement.value = data.salaryFrequency || "yr"
        salaryCompareElement.value = data.salaryCompare || "min";
        verifiedElement.checked = data.verified || false;
        if (data.companies) {
            companies = new Set(data.companies);
        }

        stateElement.addEventListener("input", () => {
            updateDivElement.innerHTML = "";
        });

        salaryElement.addEventListener("input", () => {
            showSalaries();
            updateDivElement.innerHTML = "";
        });

        salaryFrequencyElement.addEventListener("input", () => {
            showSalaries();
            updateDivElement.innerHTML = "";
        });

        salaryCompareElement.addEventListener("input", () => {
            updateDivElement.innerHTML = "";
        });

        document.getElementById("companyButton").addEventListener("click", () => {
            if (companyElement.value.trim()) {
                companies.add(companyElement.value.trim());
                showBlacklist();
                updateDivElement.innerHTML = "";
            }
        });

        verifiedElement.addEventListener("input", () => {
            updateDivElement.innerHTML = "";
        });

        document.getElementById("updateButton").addEventListener("click", () => {
            chrome.storage.local.set({
                state: stateElement.value,
                salary: parseFloat(salaryElement.value),
                salaryFrequency: salaryFrequencyElement.value,
                salaryCompare: salaryCompareElement.value,
                companies: [...companies],
                verified: verifiedElement.checked
            });

            updateDivElement.innerHTML = "Updated";
        });

        showSalaries();
        showBlacklist();
        updateDivElement.innerHTML = "Loaded";
    });
});

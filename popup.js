function showBlacklist(companies) {
    document.getElementById("companyDiv").innerHTML = "";
    const ul = document.createElement("ul");
    for (const company of companies.values()) {
        const li = document.createElement("li");
        li.innerHTML = company + "&nbsp;";
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = "Remove";
        button.addEventListener("click", () => {
            companies.delete(company);
            showBlacklist(companies);
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
        if (document.getElementById("salaryFrequency").value === "hr") {
            const hr = roundDollar(parseFloat(document.getElementById("salary").value));
            const mo = roundDollar(hr * 40.0 * 52.0 / 12.0);
            const yr = roundDollar(hr * 40.0 * 52.0);
            changeSalaryDiv(hr, mo, yr);
        } else if (document.getElementById("salaryFrequency").value === "mo") {
            const mo = roundDollar(parseFloat(document.getElementById("salary").value));
            const hr = roundDollar(mo / (40.0 * 52.0 / 12.0));
            const yr = roundDollar(mo * 12.0);
            changeSalaryDiv(hr, mo, yr);
        } else if (document.getElementById("salaryFrequency").value === "yr") {
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

document.addEventListener("DOMContentLoaded", async () => {
    const stateElement = document.getElementById("state");
    const salaryElement = document.getElementById("salary");
    const salaryFrequencyElement = document.getElementById("salaryFrequency");
    const salaryCompareElement = document.getElementById("salaryCompare");
    const companyElement = document.getElementById("company");
    const verifiedElement = document.getElementById("verified");
    const updateDivElement = document.getElementById("updateDiv");
    let storage = await getStorage();
    stateElement.value = storage.state;
    salaryElement.value = storage.salary;
    salaryFrequencyElement.value = storage.salaryFrequency;
    salaryCompareElement.value = storage.salaryCompare;
    verifiedElement.checked = storage.verified;

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
        if (companyElement.value.trim() && !storage.companies.has(companyElement.value.trim())) {
            storage.companies.add(companyElement.value.trim());
            companyElement.value = "";
            showBlacklist(storage.companies);
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
            companies: storage.companies.serialize(),
            verified: verifiedElement.checked
        });

        updateDivElement.innerHTML = "Updated";
    });

    showSalaries();
    showBlacklist(storage.companies);
    updateDivElement.innerHTML = "Loaded";
});

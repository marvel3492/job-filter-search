class CaseInsensitiveSet {
    constructor(payload = []) {
        this.map = new Map(payload);
    }
    add(value) {
        this.map.set(value.toLowerCase(), value);
    }
    has(value) {
        return this.map.has(value.toLowerCase());
    }
    delete(value) {
        return this.map.delete(value.toLowerCase());
    }
    values() {
        return this.map.values();
    }
    serialize() {
        return Array.from(this.map);
    }
}

function roundDollar(salary) {
    return Math.round(salary * 100.0) / 100.0
}

function getStorage() {
    return new Promise(function(resolve) {
        chrome.storage.local.get([
            "state",
            "salary",
            "salaryFrequency",
            "salaryCompare",
            "companies",
            "locations",
            "verified"
        ], data => {
            resolve({
                "state": data.state || "",
                "salary": data.salary || 0,
                "salaryFrequency": data.salaryFrequency || "yr",
                "salaryCompare": data.salaryCompare || "min",
                "companies": data.companies === null ? new CaseInsensitiveSet() : new CaseInsensitiveSet(data.companies),
                "locations": data.locations === null ? new CaseInsensitiveSet() : new CaseInsensitiveSet(data.locations),
                "verified": data.verified || false
            });
        });
    });
}

const
    fs = require("fs");

let file1 = null;
let file2 = null;
let nameColumnIndex = 0;
let valueColumnIndex = 0;

const SENSITIVE_KEYS = /[Pp]assword|[Ss]ecret/;

/** @type {Map<String, [String, String]>} */
const valuesByPropertyName = new Map();

function main(args) {
    if (args.length !== 4) {
        fatal("Usage: node props-diff <file1> <file2> <name-column-index> <value-column-index>");
    }
    [file1, file2, nameColumnIndex, valueColumnIndex] = args;

    processFile(file1, 0);
    processFile(file2, 1);
    generateOutputFile();
}

function processFile(fileName, fileIndex) {
    const contents = fs.readFileSync(fileName, "utf-8");
    const lines = contents.split("\n");
    // if (lines.length === 0) {
    //     fatal(`File ${fileName} is empty!`);
    // }

    const minimumExpectedColumnsCount = Math.max(nameColumnIndex, valueColumnIndex) + 1;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.length === 0) {
            continue;  // skip empty line
        }
        const columns = line.split("\t");
        if (columns.length < minimumExpectedColumnsCount) {
            fatal(`Too few columns in ${fileName}, line ${i + 1}. ` +
                `Expected ${minimumExpectedColumnsCount} due to column indexes provided.`);
        }
        const [name, value] = [columns[nameColumnIndex], columns[valueColumnIndex]];

        let values = valuesByPropertyName.get(name);
        if (!values) {
            values = Array(2);
            values[0] = values[1] = "";
            valuesByPropertyName.set(name, values);
        }
        values[fileIndex] = value.replace(/"/g, "\\\"");
    }
}

function generateOutputFile() {
    const names = Array.from(valuesByPropertyName.keys());
    names.sort((a, b) => a.localeCompare(b));

    const result = [];
    for (const name of names) {
        const [value1, value2] = checkForSensitiveData(name, valuesByPropertyName.get(name));
        result.push(`"${name}": ["${value1}", "${value2}"],`);
    }

    const templateFile = fs.readFileSync("index.html", "utf-8");
    const output = templateFile
        .replace("$RESULT", result.join("\n"))
        .replace("$LEFT", file1)
        .replace("$RIGHT", file2);

    fs.writeFileSync("output.html", output);
}

function checkForSensitiveData(name, values) {
    return SENSITIVE_KEYS.test(name) ? ["removed", "removed"] : values;
}

function fatal(msg) {
    console.error(msg);
    process.exit(1);
}

main(process.argv.slice(2));

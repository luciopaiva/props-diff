
# props-diff

Compares two TSV files containing properties and shows an HTML summary of the comparison, highligthing fields that differ and that are also missing.

Assumptions:

- files are TSV
- file are encoded in UTF-8
- columns are not surrounded by quotes
- first row is **not** headers, but data

## To do

- get rid of the Node.js part, make it work using only the browser
- toggle sensitive fields on/off
